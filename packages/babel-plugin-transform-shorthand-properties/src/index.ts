import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-shorthand-properties",

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

          const computedKey = t.toComputedKey(node);
          if (t.isStringLiteral(computedKey, { value: "__proto__" })) {
            path.replaceWith(t.objectProperty(computedKey, func, true));
          } else {
            path.replaceWith(t.objectProperty(node.key, func, node.computed));
          }
        }
      },

      ObjectProperty(path) {
        const { node } = path;
        if (node.shorthand) {
          const computedKey = t.toComputedKey(node);
          if (t.isStringLiteral(computedKey, { value: "__proto__" })) {
            path.replaceWith(t.objectProperty(computedKey, node.value, true));
          } else {
            node.shorthand = false;
          }
        }
      },
    },
  };
});
