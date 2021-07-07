import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-member-expression-literals",

    visitor: {
      MemberExpression: {
        exit({ node }) {
          const prop = node.property;
          if (
            !node.computed &&
            t.isIdentifier(prop) &&
            !t.isValidES3Identifier(prop.name)
          ) {
            // foo.default -> foo["default"]
            node.property = t.stringLiteral(prop.name);
            node.computed = true;
          }
        },
      },
    },
  };
});
