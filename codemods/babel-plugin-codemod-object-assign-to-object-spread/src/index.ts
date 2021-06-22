import syntaxObjectRestSpread from "@babel/plugin-syntax-object-rest-spread";

export default function ({ types: t }) {
  return {
    inherits: syntaxObjectRestSpread.default,

    visitor: {
      CallExpression(path) {
        if (!path.get("callee").matchesPattern("Object.assign")) return;

        const args = path.get("arguments");
        if (args.length === 0) return;

        const [objPath] = args;
        if (!objPath.isObjectExpression()) return;

        const obj = objPath.node;
        const { properties } = obj;

        for (let i = 1; i < args.length; i++) {
          const arg = args[i];
          const { node } = arg;

          if (arg.isObjectExpression()) {
            properties.push(...node.properties);
          } else {
            properties.push(t.spreadElement(node));
          }
        }

        path.replaceWith(obj);
      },
    },
  };
}
