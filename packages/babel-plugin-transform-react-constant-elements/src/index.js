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

  const immutabiltyVisitor = {
    enter(path, state) {
      const stop = () => {
        state.isImmutable = false;
        path.stop();
      };
      const skip = () => {
        path.skip();
      };

      if (path.isJSXClosingElement()) return skip();

      // Elements with refs are not safe to hoist.
      if (
        path.isJSXIdentifier({ name: "ref" }) &&
        path.parentPath.isJSXAttribute({ name: path.node })
      ) {
        return stop();
      }

      // Ignore identifiers, JSX expressions and immutable values.
      if (
        path.isJSXIdentifier() ||
        path.isIdentifier() ||
        path.isJSXMemberExpression() ||
        path.isJSXNamespacedName() ||
        path.isImmutable()
      ) {
        return;
      }

      // If we allow mutable props, tags with function expressions can be
      // safely hoisted.
      const { mutablePropsAllowed } = state;
      if (mutablePropsAllowed && path.isFunction()) return skip();

      if (!path.isPure()) return stop();

      // If it's not immutable, it may still be a pure expression, such as string concatenation.
      // It is still safe to hoist that, so long as its result is immutable.
      // If not, it is not safe to replace as mutable values (like objects) could be mutated after render.
      // https://github.com/facebook/react/issues/3226
      const expressionResult = path.evaluate();
      if (expressionResult.confident) {
        // We know the result; check its mutability.
        const { value } = expressionResult;
        if (
          mutablePropsAllowed ||
          value === null ||
          (typeof value !== "object" && typeof value !== "function")
        ) {
          // It evaluated to an immutable value, so we can hoist it.
          return skip();
        }
      } else if (t.isIdentifier(expressionResult.deopt)) {
        // It's safe to hoist here if the deopt reason is an identifier (e.g. func param).
        // The hoister will take care of how high up it can be hoisted.
        return;
      }

      stop();
    },
  };

  const targetScopeVisitor = {
    ReferencedIdentifier(path, state) {
      const { node } = path;
      let { scope } = path;

      while (scope !== state.jsxScope) {
        // If a binding is declared in an inner function, it doesn't affect hoisting.
        if (declares(node, scope)) return;

        scope = scope.parent;
      }

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

        const immutabilityState = {
          isImmutable: true,
          mutablePropsAllowed,
        };
        // Traverse all props passed to this element for immutability
        path.traverse(immutabiltyVisitor, immutabilityState);
        if (!immutabilityState.isImmutable) return;

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

        const targetScopeState = {
          jsxScope,
          targetScope: path.scope.getProgramParent(),
        };
        path.traverse(targetScopeVisitor, targetScopeState);

        const { targetScope } = targetScopeState;
        HOISTED.set(path.node, targetScope);

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
