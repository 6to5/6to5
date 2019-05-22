module.exports = function({ types: t }) {
  return {
    visitor: {
      CallExpression(path) {
        if (path.node.callee.name === "a") {
          // the import we add here should not be elided
          path.scope
            .getProgramParent()
            .path.unshiftContainer(
              "body",
              t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier("local"))],
                t.stringLiteral("source")
              )
            );

          // with this crawl, babel-plugin-transform-typescript
          // used to elide the import we just added
          // https://github.com/babel/babel/issues/7592
          path.scope.crawl();
          path.node.callee = t.identifier("local");
          path.scope.crawl();
        }
      },
    },
  };
};
