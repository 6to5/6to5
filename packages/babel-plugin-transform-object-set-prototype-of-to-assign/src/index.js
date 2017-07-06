export default function() {
  return {
    visitor: {
      CallExpression(path, file) {
        if (path.get("callee").matchesPattern("Object.setPrototypeOf")) {
          path.node.callee = file.addHelper("defaults");
        }
      },
    },
  };
}
