import syntaxNumericSeparator from "babel-plugin-syntax-numeric-separator";

export default function({ types: t }) {
  function replacer(value) {
    return value.replace(/_/g, "");
  }

  function replaceNumberArg({ node }) {
    if (node.callee.name !== "Number") {
      return;
    }
    const arg = node.arguments[0];
    if (!t.isStringLiteral(arg)) {
      return;
    }
    arg.value = replacer(arg.value);
  }

  const CallExpression = replaceNumberArg;
  const NewExpression = replaceNumberArg;

  return {
    inherits: syntaxNumericSeparator,

    visitor: {
      CallExpression,
      NewExpression,
      NumericLiteral({ node }) {
        if (node.extra && /_/.test(node.extra.raw)) {
          node.value = replacer(node.extra.raw);
        }
      },
    },
  };
}
