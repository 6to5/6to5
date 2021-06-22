import { declare } from "@babel/helper-plugin-utils";
import build from "@babel/helper-builder-binary-assignment-operator-visitor";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-exponentiation-operator",

    visitor: build({
      operator: "**",

      build(left, right) {
        return t.callExpression(
          t.memberExpression(t.identifier("Math"), t.identifier("pow")),
          [left, right],
        );
      },
    }),
  };
});
