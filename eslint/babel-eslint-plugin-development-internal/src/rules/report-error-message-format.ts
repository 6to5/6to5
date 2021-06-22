const messageId = "mustMatchPattern";

const pattern = /(('.*')|(`.*`)|[A-Z]).*(\.|\?)$/s;

export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce @babel/parser's error message formatting.",
    },
    messages: {
      [messageId]: `Report message does not match the pattern ${pattern.toString()}.`,
    },
  },
  create({ report }) {
    return {
      "CallExpression[callee.type='Identifier'][callee.name='makeErrorTemplates'] > ObjectExpression > Property[value.type='Literal']"(
        node,
      ) {
        const { value } = node;
        if (typeof value.value === "string" && pattern.test(value.value)) {
          return;
        }
        report({
          node: value,
          messageId,
        });
      },
    };
  },
};
