import { declare } from "@babel/helper-plugin-utils";
import syntaxNumericSeparator from "@babel/plugin-syntax-numeric-separator";

/**
 * Given a bigIntLiteral or NumericLiteral, remove numeric
 * separator `_` from its raw representation
 *
 * @param {NodePath<BigIntLiteral | NumericLiteral>} { node }: A Babel AST node path
 */
function remover({ node }: NodePath<BigIntLiteral | NumericLiteral>) {
  const { extra } = node;
  if (extra?.raw?.includes("_")) {
    extra.raw = extra.raw.replace(/_/g, "");
  }
}

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "proposal-numeric-separator",
    inherits: syntaxNumericSeparator.default,

    visitor: {
      NumericLiteral: remover,
      BigIntLiteral: remover,
    },
  };
});
