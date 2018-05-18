import { declare } from "@babel/helper-plugin-utils";
import syntaxDecorators from "@babel/plugin-syntax-decorators";
import visitor from "./transformer";
import legacyVisitor from "./transformer-legacy";

export default declare((api, options) => {
  api.assertVersion(7);

  const { legacy = false } = options;
  if (typeof legacy !== "boolean") {
    throw new Error("'legacy' must be a boolean.");
  }

  const { automaticParentheses } = options;
  if (automaticParentheses !== undefined) {
    if (legacy) {
      throw new Error(
        "'automaticParentheses' can't be used with legacy decorators.",
      );
    }
    if (typeof automaticParentheses !== "boolean") {
      throw new Error("'automaticParentheses' must be a boolean.");
    }
  }

  return {
    inherits: syntaxDecorators,

    visitor: legacy ? legacyVisitor() : visitor({ automaticParentheses }),
  };
});
