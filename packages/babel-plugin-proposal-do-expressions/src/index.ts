import { declare } from "@babel/helper-plugin-utils";
import syntaxDoExpressions from "@babel/plugin-syntax-do-expressions";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "proposal-do-expressions",
    inherits: syntaxDoExpressions,

    visitor: {
      DoExpression: {
        exit(path) {
          const { node } = path;
          if (node.async) {
            // Async do expressions are not yet supported
            return;
          }
          const body = node.body.body;
          if (body.length) {
            path.replaceExpressionWithStatements(body);
          } else {
            path.replaceWith(path.scope.buildUndefinedNode());
          }
        },
      },
    },
  };
});
