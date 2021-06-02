module.exports = function ({ types: t }) {
  return {
    visitor: {
      Program: {
        enter(path) {
          path.pushContainer(
            "body",
            t.JSXElement(
              t.JSXOpeningElement(t.JSXIdentifier("div"), [], false),
              t.JSXClosingElement(t.JSXIdentifier("div")),
              []
            )
          );
        }
      }
    }
  };
};
