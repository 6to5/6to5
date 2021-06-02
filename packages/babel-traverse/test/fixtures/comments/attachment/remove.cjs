module.exports = function() {
  return {
    visitor: {
      Identifier(path) {
        const node = path.node;
        if (node.name === "willRemove") {
          path.remove();
        }
      },
    },
  };
};
