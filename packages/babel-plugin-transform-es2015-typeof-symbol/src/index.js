export default function({ types: t }) {
  const IGNORE = Symbol();

  return {
    visitor: {
      Scope({ scope }) {
        if (!scope.getBinding("Symbol")) {
          return;
        }

        scope.rename("Symbol");
      },

      UnaryExpression(path) {
        const { node, parent } = path;
        if (node[IGNORE]) return;
        if (path.find(path => path.node && !!path.node._generated)) return;

        if (
          path.parentPath.isBinaryExpression() &&
          t.EQUALITY_BINARY_OPERATORS.indexOf(parent.operator) >= 0
        ) {
          // optimise `typeof foo === "string"` since we can determine that they'll never
          // need to handle symbols
          const opposite = path.getOpposite();
          if (
            opposite.isLiteral() &&
            opposite.node.value !== "symbol" &&
            opposite.node.value !== "object"
          ) {
            return;
          }
        }

        if (node.operator === "typeof") {
          const call = t.callExpression(this.addHelper("typeof"), [
            node.argument,
          ]);
          if (path.get("argument").isIdentifier()) {
            const undefLiteral = t.stringLiteral("undefined");
            const unary = t.unaryExpression("typeof", node.argument);
            unary[IGNORE] = true;
            path.replaceWith(
              t.conditionalExpression(
                t.binaryExpression("===", unary, undefLiteral),
                undefLiteral,
                call,
              ),
            );
          } else {
            path.replaceWith(call);
          }
        }
      },
    },
  };
}
