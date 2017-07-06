import build from "babel-helper-builder-binary-assignment-operator-visitor";
import syntaxExponentiationOperator from "babel-plugin-syntax-exponentiation-operator";

export default function({ types: t }) {
  return {
    inherits: syntaxExponentiationOperator,

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
}
