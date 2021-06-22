import { declare } from "@babel/helper-plugin-utils";
import nameFunction from "@babel/helper-function-name";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-function-name",

    visitor: {
      FunctionExpression: {
        exit(path) {
          if (path.key !== "value" && !path.parentPath.isObjectProperty()) {
            const replacement = nameFunction(path);
            if (replacement) path.replaceWith(replacement);
          }
        },
      },

      ObjectProperty(path) {
        const value = path.get("value");
        if (value.isFunction()) {
          const newNode = nameFunction(value);
          if (newNode) value.replaceWith(newNode);
        }
      },
    },
  };
});
