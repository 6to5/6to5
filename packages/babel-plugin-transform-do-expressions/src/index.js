import syntaxDoExpressions from "babel-plugin-syntax-do-expressions";

export default function() {
  return {
    inherits: syntaxDoExpressions,

    visitor: {
      DoExpression: {
        exit(path) {
          const body = path.node.body.body;
          if (body.length) {
            path.replaceExpressionWithStatements(body);
          } else {
            path.replaceWith(path.scope.buildUndefinedNode());
          }
        },
      },
    },
  };
}
