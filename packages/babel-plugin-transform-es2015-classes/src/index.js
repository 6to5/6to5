import LooseTransformer from "./loose";
import VanillaTransformer from "./vanilla";
import nameFunction from "babel-helper-function-name";

export default function({ types: t }) {
  // todo: investigate traversal requeueing
  const VISITED = Symbol();

  return {
    visitor: {
      ExportDefaultDeclaration(path) {
        if (!path.get("declaration").isClassDeclaration()) return;

        const { node } = path;
        const ref =
          node.declaration.id || path.scope.generateUidIdentifier("class");
        node.declaration.id = ref;

        // Split the class declaration and the export into two separate statements.
        path.replaceWith(node.declaration);
        path.insertAfter(
          t.exportNamedDeclaration(null, [
            t.exportSpecifier(ref, t.identifier("default")),
          ]),
        );
      },

      ClassDeclaration(path) {
        const { node } = path;

        const ref = node.id || path.scope.generateUidIdentifier("class");

        path.replaceWith(
          t.variableDeclaration("let", [
            t.variableDeclarator(ref, t.toExpression(node)),
          ]),
        );
      },

      ClassExpression(path, state) {
        const { node } = path;
        if (node[VISITED]) return;

        const inferred = nameFunction(path);
        if (inferred && inferred !== node) return path.replaceWith(inferred);

        node[VISITED] = true;

        let Constructor = VanillaTransformer;
        if (state.opts.loose) Constructor = LooseTransformer;

        path.replaceWith(new Constructor(path, state.file).run());

        if (
          path.isCallExpression() &&
          path.get("callee").isArrowFunctionExpression()
        ) {
          path.get("callee").arrowFunctionToExpression();
        }
      },
    },
  };
}
