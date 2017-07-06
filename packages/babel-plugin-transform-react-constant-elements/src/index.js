export default function({ types: t }) {
  const immutabilityVisitor = {
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
        path.isIdentifier() ||
        path.isJSXMemberExpression()
      ) {
        return;
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
              (value && typeof value === "object") ||
              typeof value === "function";
            if (!isMutable) {
              // It evaluated to an immutable value, so we can hoist it.
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
  };

  return {
    visitor: {
      JSXElement(path) {
        if (path.node._hoisted) return;

        const state = { isImmutable: true };
        path.traverse(immutabilityVisitor, state);

        if (state.isImmutable) {
          path.hoist();
        } else {
          path.node._hoisted = true;
        }
      },
    },
  };
}
