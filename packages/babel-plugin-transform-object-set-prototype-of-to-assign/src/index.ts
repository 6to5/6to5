import { declare } from "@babel/helper-plugin-utils";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-object-set-prototype-of-to-assign",

    visitor: {
      CallExpression(path, file) {
        if (path.get("callee").matchesPattern("Object.setPrototypeOf")) {
          path.node.callee = file.addHelper("defaults");
        }
      },
    },
  };
});
