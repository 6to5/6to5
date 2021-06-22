import { declare } from "@babel/helper-plugin-utils";
import syntaxExportDefaultFrom from "@babel/plugin-syntax-export-default-from";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "proposal-export-default-from",
    inherits: syntaxExportDefaultFrom,

    visitor: {
      ExportNamedDeclaration(path) {
        const { node, scope } = path;
        const { specifiers } = node;
        if (!t.isExportDefaultSpecifier(specifiers[0])) return;

        const specifier = specifiers.shift();
        const { exported } = specifier;
        const uid = scope.generateUidIdentifier(exported.name);

        const nodes = [
          t.importDeclaration(
            [t.importDefaultSpecifier(uid)],
            t.cloneNode(node.source),
          ),
          t.exportNamedDeclaration(null, [
            t.exportSpecifier(t.cloneNode(uid), exported),
          ]),
        ];

        if (specifiers.length >= 1) {
          nodes.push(node);
        }

        const [importDeclaration] = path.replaceWithMultiple(nodes);
        path.scope.registerDeclaration(importDeclaration);
      },
    },
  };
});
