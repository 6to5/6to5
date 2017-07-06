export default function() {
  return {
    visitor: {
      CallExpression: function(path, file) {
        if (path.get("callee").matchesPattern("Object.assign")) {
          path.node.callee = file.addHelper("extends");
        }
      },
    },
  };
}
