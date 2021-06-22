import newCap from "./rules/new-cap";
import noInvalidThis from "./rules/no-invalid-this";
import noUnusedExpressions from "./rules/no-unused-expressions";
import objectCurlySpacing from "./rules/object-curly-spacing";
import semi from "./rules/semi";

export const rules = {
  "new-cap": newCap,
  "no-invalid-this": noInvalidThis,
  "no-unused-expressions": noUnusedExpressions,
  "object-curly-spacing": objectCurlySpacing,
  semi,
};

export const rulesConfig = {
  "new-cap": "off",
  "no-invalid-this": "off",
  "no-unused-expressions": "off",
  "object-curly-spacing": "off",
  semi: "off",
};

export default { rules, rulesConfig };
