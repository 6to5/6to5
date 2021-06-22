import { declare } from "@babel/helper-plugin-utils";
import syntaxOptionalChaining from "@babel/plugin-syntax-optional-chaining";
import { transform } from "./transform";

export default declare((api, options) => {
  api.assertVersion(7);

  const { loose = false } = options;
  const noDocumentAll = api.assumption("noDocumentAll") ?? loose;
  const pureGetters = api.assumption("pureGetters") ?? loose;

  return {
    name: "proposal-optional-chaining",
    inherits: syntaxOptionalChaining.default,

    visitor: {
      "OptionalCallExpression|OptionalMemberExpression"(path) {
        transform(path, { noDocumentAll, pureGetters });
      },
    },
  };
});

export { transform };
