import { declare } from "@babel/helper-plugin-utils";
import { types as t, template } from "@babel/core";

export default declare((api, options) => {
  api.assertVersion(7);

  const { allowMutablePropsOnTags } = options;

  if (
    allowMutablePropsOnTags != null &&
    !Array.isArray(allowMutablePropsOnTags)
  ) {
    throw new Error(
      ".allowMutablePropsOnTags must be an array, null, or undefined.",
    );
  }

  // Element -> Target scope
  const HOISTED = new WeakMap();

  function declares(node: t.Identifier | t.JSXIdentifier, scope) {
    if (
      t.isJSXIdentifier(node, { name: "this" }) ||
      t.isJSXIdentifier(node, { name: "arguments" }) ||
      t.isJSXIdentifier(node, { name: "super" }) ||
      t.isJSXIdentifier(node, { name: "new" })
    ) {
      const { path } = scope;
      return path.isFunctionParent() && !path.isArrowFunctionExpression();
    }

    return scope.hasOwnBinding(node.name);
  }

  function isHoistingScope({ path }) {
    return path.isFunctionParent() || path.isLoop() || path.isProgram();
  }

  function getHoistingScope(scope) {
    while (!isHoistingScope(scope)) scope = scope.parent;
    return scope;
  }

  const analyzer = {
    enter(path, state) {
      const stop = () => {
        state.isImmutable = false;
        path.stop();
      };

      if (path.isJSXClosingElement()) {
        path.skip();
        return;
      }

      // Elements with refs are not safe to hoist.
      if (
        path.isJSXIdentifier({ name: "ref" }) &&
        path.parentPath.isJSXAttribute({ name: path.node })
      ) {
        return stop();
      }

      // Ignore identifiers & JSX expressions.
      if (
        path.isJSXIdentifier() ||
        path.isJSXMemberExpression() ||
        path.isJSXNamespacedName()
      ) {
        return;
      }

      if (path.isIdentifier()) {
        const binding = path.scope.getBinding(path.node.name);
        if (binding && binding.constant) return;
      }

      if (!path.isImmutable()) {
        // If it's not immutable, it may still be a pure expression, such as string concatenation.
        // It is still safe to hoist that, so long as its result is immutable.
        // If not, it is not safe to replace as mutable values (like objects) could be mutated after render.
        // https://github.com/facebook/react/issues/3226
        if (path.isPure()) {
          const expressionResult = path.evaluate();
          if (expressionResult.confident) {
            // We know the result; check its mutability.
            const { value } = expressionResult;
            const isMutable =
              (!state.mutablePropsAllowed &&
                value &&
                typeof value === "object") ||
              typeof value === "function";
            if (!isMutable) {
              // It evaluated to an immutable value, so we can hoist it.
              path.skip();
              return;
            }
          } else if (t.isIdentifier(expressionResult.deopt)) {
            // It's safe to hoist here if the deopt reason is an identifier (e.g. func param).
            // The hoister will take care of how high up it can be hoisted.
            return;
          }
        }
        stop();
      }
    },

    ReferencedIdentifier(path, state) {
      const { node } = path;
      let { scope } = path;

      while (scope) {
        // We cannot hoist outside of the previous hoisting target
        // scope, so we return early and we don't update it.
        if (scope === state.targetScope) return;

        // If the scope declares this identifier (or we're at the function
        // providing the lexical env binding), we can't hoist the var any
        // higher.
        if (declares(node, scope)) break;

        scope = scope.parent;
      }

      state.targetScope = getHoistingScope(scope);
    },

    /*
    See the discussion at https://github.com/babel/babel/pull/12967#discussion_r587948958
    to uncomment this code.

    ReferencedIdentifier(path, state) {
      const { node } = path;
      let { scope } = path;
      let targetScope;

      let isNestedScope = true;
      let needsHoisting = true;

      while (scope) {
        // We cannot hoist outside of the previous hoisting target
        // scope, so we return early and we don't update it.
        if (scope === state.targetScope) return;

        // When we hit the scope of our JSX element, we must start
        // checking if they declare the binding of the current
        // ReferencedIdentifier.
        // We don't case about bindings declared in nested scopes,
        // because the whole nested scope is hoisted alongside the
        // JSX element so it doesn't impose any extra constraint.
        if (scope === state.jsxScope) {
          isNestedScope = false;
        }

        // If we are in an upper scope and hoisting to this scope has
        // any benefit, we update the possible targetScope to the
        // current one.
        if (!isNestedScope && needsHoisting) {
          targetScope = scope;
        }

        // When we start walking in upper scopes, avoid hoisting JSX
        // elements until we hit a scope introduced by a function or
        // loop.
        // This is because hoisting from the inside to the outside
        // of block or if statements doesn't give any performance
        // benefit, and it just unnecessarily increases the code size.
        if (scope === state.jsxScope) {
          needsHoisting = false;
        }
        if (!needsHoisting && isHoistingScope(scope)) {
          needsHoisting = true;
        }

        // If the current scope declares the ReferencedIdentifier we
        // are checking, we break out of this loop. There are two
        // possible scenarios:
        //  1. We are in a nested scope, this this declaration means
        //     that this reference doesn't affect the target scope.
        //     The targetScope variable is still undefined.
        //  2. We are in an upper scope, so this declaration defines
        //     a new hoisting constraint. The targetScope variable
        //     refers to the current scope.
        if (declares(node, scope)) break;

        scope = scope.parent;
      }

      if (targetScope) state.targetScope = targetScope;
    },*/
  };

  return {
    name: "transform-react-constant-elements",

    visitor: {
      JSXElement(path) {
        if (HOISTED.has(path.node)) return;
        HOISTED.set(path.node, path.scope);

        const name = path.node.openingElement.name;

        // This transform takes the option `allowMutablePropsOnTags`, which is an array
        // of JSX tags to allow mutable props (such as objects, functions) on. Use sparingly
        // and only on tags you know will never modify their own props.
        let mutablePropsAllowed = false;
        if (allowMutablePropsOnTags != null) {
          // Get the element's name. If it's a member expression, we use the last part of the path.
          // So the option ["FormattedMessage"] would match "Intl.FormattedMessage".
          let lastSegment = name;
          while (t.isJSXMemberExpression(lastSegment)) {
            lastSegment = lastSegment.property;
          }

          const elementName = lastSegment.name;
          mutablePropsAllowed = allowMutablePropsOnTags.includes(elementName);
        }

        const state = {
          isImmutable: true,
          mutablePropsAllowed,
          targetScope: path.scope.getProgramParent(),
        };

        // Traverse all props passed to this element for immutability,
        // and compute the target hoisting scope
        path.traverse(analyzer, state);

        if (!state.isImmutable) return;

        const { targetScope } = state;
        HOISTED.set(path.node, targetScope);

        // In order to avoid hoisting unnecessarily, we need to know which is
        // the scope containing the current JSX element. If a parent of the
        // current element has already been hoisted, we can consider its target
        // scope as the base scope for the current element.
        let jsxScope;
        let current = path;
        while (!jsxScope && current.parentPath.isJSX()) {
          current = current.parentPath;
          jsxScope = HOISTED.get(current.node);
        }
        jsxScope ??= getHoistingScope(path.scope);

        // Only hoist if it would give us an advantage.
        if (targetScope === jsxScope) return;

        const id = path.scope.generateUidBasedOnNode(name);
        targetScope.push({ id: t.identifier(id) });

        let replacement = template.expression.ast`
          ${t.identifier(id)} || (${t.identifier(id)} = ${path.node})
        `;
        if (
          path.parentPath.isJSXElement() ||
          path.parentPath.isJSXAttribute()
        ) {
          replacement = t.jsxExpressionContainer(replacement);
        }

        path.replaceWith(replacement);
      },
    },
  };
});
