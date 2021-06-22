import noDeprecatedClone from "./rules/no-deprecated-clone";
import noUndefinedIdentifier from "./rules/no-undefined-identifier";
import pluginName from "./rules/plugin-name";

export const rules = {
  "no-deprecated-clone": noDeprecatedClone,
  "no-undefined-identifier": noUndefinedIdentifier,
  "plugin-name": pluginName,
};

export default { rules };
