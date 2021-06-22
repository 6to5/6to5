import { declare } from "@babel/helper-plugin-utils";
import * as defineMap from "@babel/helper-define-map";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-property-mutators",

    visitor: {
      ObjectExpression(path, file) {
        const { node } = path;
        let hasAny = false;
        for (const prop of (node.properties: Array)) {
          if (prop.kind === "get" || prop.kind === "set") {
            hasAny = true;
            break;
          }
        }
        if (!hasAny) return;

        const mutatorMap = {};

        node.properties = node.properties.filter(function (prop) {
          if (!prop.computed && (prop.kind === "get" || prop.kind === "set")) {
            defineMap.push(mutatorMap, prop, null, file);
            return false;
          } else {
            return true;
          }
        });

        path.replaceWith(
          t.callExpression(
            t.memberExpression(
              t.identifier("Object"),
              t.identifier("defineProperties"),
            ),
            [node, defineMap.toDefineObject(mutatorMap)],
          ),
        );
      },
    },
  };
});
