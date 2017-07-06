export default function({ types: t }) {
  return {
    visitor: {
      FunctionExpression: {
        exit(path) {
          const { node } = path;
          if (!node.id) return;
          node._ignoreUserWhitespace = true;

          path.replaceWith(
            t.callExpression(
              t.functionExpression(
                null,
                [],
                t.blockStatement([
                  t.toStatement(node),
                  t.returnStatement(node.id),
                ]),
              ),
              [],
            ),
          );
        },
      },
    },
  };
}
