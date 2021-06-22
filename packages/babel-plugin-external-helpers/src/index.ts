import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";

export default declare((api, options) => {
  api.assertVersion(7);

  const { helperVersion = "7.0.0-beta.0", whitelist = false } = options;

  if (
    whitelist !== false &&
    (!Array.isArray(whitelist) || whitelist.some(w => typeof w !== "string"))
  ) {
    throw new Error(
      ".whitelist must be undefined, false, or an array of strings",
    );
  }

  const helperWhitelist = whitelist ? new Set(whitelist) : null;

  return {
    name: "external-helpers",
    pre(file) {
      file.set("helperGenerator", name => {
        // If the helper didn't exist yet at the version given, we bail
        // out and let Babel either insert it directly, or throw an error
        // so that plugins can handle that case properly.
        if (
          file.availableHelper &&
          !file.availableHelper(name, helperVersion)
        ) {
          return;
        }

        // babelCore.buildExternalHelpers() allows a whitelist of helpers that
        // will be inserted into the external helpers list. That same whitelist
        // should be passed into the plugin here in that case, so that we can
        // avoid referencing 'babelHelpers.XX' when the helper does not exist.
        if (helperWhitelist && !helperWhitelist.has(name)) return;

        return t.memberExpression(
          t.identifier("babelHelpers"),
          t.identifier(name),
        );
      });
    },
  };
});
