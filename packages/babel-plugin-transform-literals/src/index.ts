import { declare } from "@babel/helper-plugin-utils";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-literals",

    visitor: {
      NumericLiteral({ node }) {
        // number octal like 0b10 or 0o70
        if (node.extra && /^0[ob]/i.test(node.extra.raw)) {
          node.extra = undefined;
        }
      },

      StringLiteral({ node }) {
        // unicode escape
        if (node.extra && /\\[u]/gi.test(node.extra.raw)) {
          node.extra = undefined;
        }
      },
    },
  };
});
