module.exports = function() {
  return {
    visitor: {
      Identifier(path) {
        if (path.node.name == "number") {
          path.node.name = "string";
        }
      }
    }
  };
}
