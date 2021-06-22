import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-new-target",

    visitor: {
      MetaProperty(path) {
        const meta = path.get("meta");
        const property = path.get("property");
        const { scope } = path;

        if (
          meta.isIdentifier({ name: "new" }) &&
          property.isIdentifier({ name: "target" })
        ) {
          const func = path.findParent(path => {
            if (path.isClass()) return true;
            if (path.isFunction() && !path.isArrowFunctionExpression()) {
              if (path.isClassMethod({ kind: "constructor" })) {
                return false;
              }

              return true;
            }
            return false;
          });

          if (!func) {
            throw path.buildCodeFrameError(
              "new.target must be under a (non-arrow) function or a class.",
            );
          }

          const { node } = func;
          if (!node.id) {
            if (func.isMethod()) {
              path.replaceWith(scope.buildUndefinedNode());
              return;
            }

            node.id = scope.generateUidIdentifier("target");
          }

          const constructor = t.memberExpression(
            t.thisExpression(),
            t.identifier("constructor"),
          );

          if (func.isClass()) {
            path.replaceWith(constructor);
            return;
          }

          path.replaceWith(
            t.conditionalExpression(
              t.binaryExpression(
                "instanceof",
                t.thisExpression(),
                t.cloneNode(node.id),
              ),
              constructor,
              scope.buildUndefinedNode(),
            ),
          );
        }
      },
    },
  };
});
