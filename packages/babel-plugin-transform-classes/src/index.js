// @flow
import { declare } from "@babel/helper-plugin-utils";
import annotateAsPure from "@babel/helper-annotate-as-pure";
import nameFunction from "@babel/helper-function-name";
import splitExportDeclaration from "@babel/helper-split-export-declaration";
import { types as t } from "@babel/core";
import type { NodePath } from "@babel/traverse";
import globals from "globals";
import transformClass from "./transformClass";

const getBuiltinClasses = category =>
  Object.keys(globals[category]).filter(name => /^[A-Z]/.test(name));

const builtinClasses = new Set([
  ...getBuiltinClasses("builtin"),
  ...getBuiltinClasses("browser"),
]);

export default declare((api, options) => {
  api.assertVersion(7);

  const { loose } = options;

  // todo: investigate traversal requeueing
  const VISITED = Symbol();

  return {
    name: "transform-classes",

    visitor: {
      ExportDefaultDeclaration(path: NodePath) {
        if (!path.get("declaration").isClassDeclaration()) return;
        splitExportDeclaration(path);
      },

      ClassDeclaration(path: NodePath) {
        const { node } = path;

        const ref = node.id || path.scope.generateUidIdentifier("class");

        path.replaceWith(
          t.variableDeclaration("let", [
            t.variableDeclarator(ref, t.toExpression(node)),
          ]),
        );
      },

      ClassExpression(path: NodePath, state: any) {
        const { node } = path;
        if (node[VISITED]) return;

        const inferred = nameFunction(path);
        if (inferred && inferred !== node) {
          path.replaceWith(inferred);
          return;
        }

        node[VISITED] = true;

        const result = transformClass(path, state.file, builtinClasses, loose);
        if (result.classAddition) {
          path.replaceWith(result.classCode);
          path.parentPath.parentPath.insertAfter(result.classAddition);
        } else {
          path.replaceWith(result);
        }

        if (path.isCallExpression()) {
          annotateAsPure(path);
          if (path.get("callee").isArrowFunctionExpression()) {
            path.get("callee").arrowFunctionToExpression();
          }
        }
      },
    },
  };
});
