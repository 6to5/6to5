import { declare } from "@babel/helper-plugin-utils";
import syntaxJsonStrings from "@babel/plugin-syntax-json-strings";

export default declare(api => {
  api.assertVersion(7);
  const regex = /(\\*)([\u2028\u2029])/g;
  function replace(match, escapes, separator) {
    // If there's an odd number, that means the separator itself was escaped.
    // "\X" escapes X.
    // "\\X" escapes the backslash, so X is unescaped.
    const isEscaped = escapes.length % 2 === 1;
    if (isEscaped) return match;

    return `${escapes}\\u${separator.charCodeAt(0).toString(16)}`;
  }

  return {
    name: "proposal-json-strings",
    inherits: syntaxJsonStrings.default,

    visitor: {
      "DirectiveLiteral|StringLiteral"({ node }) {
        const { extra } = node;
        if (!extra?.raw) return;

        extra.raw = extra.raw.replace(regex, replace);
      },
    },
  };
});
