import * as t from "babel-types";

export default function() {
  return {
    visitor: {
      ObjectMethod(path) {
        const { node } = path;
        if (node.kind === "method") {
          const func = t.functionExpression(
            null,
            node.params,
            node.body,
            node.generator,
            node.async,
          );
          func.returnType = node.returnType;

          path.replaceWith(t.objectProperty(node.key, func, node.computed));
        }
      },

      ObjectProperty({ node }) {
        if (node.shorthand) {
          node.shorthand = false;
        }
      },
    },
  };
}
