import { declare } from "@babel/helper-plugin-utils";
import syntaxThrowExpressions from "@babel/plugin-syntax-throw-expressions";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "proposal-throw-expressions",
    inherits: syntaxThrowExpressions,

    visitor: {
      UnaryExpression(path) {
        const { operator, argument } = path.node;
        if (operator !== "throw") return;

        const arrow = t.functionExpression(
          null,
          [t.identifier("e")],
          t.blockStatement([t.throwStatement(t.identifier("e"))]),
        );

        path.replaceWith(t.callExpression(arrow, [argument]));
      },
    },
  };
});
