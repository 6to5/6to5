import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  function statementList(key, path) {
    const paths = path.get(key);

    for (const path of paths) {
      const func = path.node;
      if (!path.isFunctionDeclaration()) continue;

      const declar = t.variableDeclaration("let", [
        t.variableDeclarator(func.id, t.toExpression(func)),
      ]);

      // hoist it up above everything else
      // @ts-expect-error todo(flow->ts): avoid mutations
      declar._blockHoist = 2;

      // todo: name this
      func.id = null;

      path.replaceWith(declar);
    }
  }

  return {
    name: "transform-block-scoped-functions",

    visitor: {
      BlockStatement(path) {
        const { node, parent } = path;
        if (
          t.isFunction(parent, { body: node }) ||
          t.isExportDeclaration(parent)
        ) {
          return;
        }

        statementList("body", path);
      },

      SwitchCase(path) {
        statementList("consequent", path);
      },
    },
  };
});
