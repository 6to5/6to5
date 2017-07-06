import bindifyDecorators from "babel-helper-bindify-decorators";
import type { NodePath } from "babel-traverse";
import * as t from "babel-types";

export default function(classPath) {
  classPath.assertClass();

  const memoisedExpressions = [];

  function maybeMemoise(path) {
    if (!path.node || path.isPure()) return;

    const uid = classPath.scope.generateDeclaredUidIdentifier();
    memoisedExpressions.push(t.assignmentExpression("=", uid, path.node));
    path.replaceWith(uid);
  }

  function memoiseDecorators(paths: Array<NodePath>) {
    if (!Array.isArray(paths) || !paths.length) return;

    // ensure correct evaluation order of decorators
    paths = paths.reverse();

    // bind decorators if they're member expressions
    bindifyDecorators(paths);

    for (const path of paths) {
      maybeMemoise(path);
    }
  }

  maybeMemoise(classPath.get("superClass"));
  memoiseDecorators(classPath.get("decorators"), true);

  const methods: Array<NodePath> = classPath.get("body.body");
  for (const methodPath of methods) {
    if (methodPath.is("computed")) {
      maybeMemoise(methodPath.get("key"));
    }

    if (methodPath.has("decorators")) {
      memoiseDecorators(classPath.get("decorators"));
    }
  }

  if (memoisedExpressions) {
    classPath.insertBefore(
      memoisedExpressions.map(expr => t.expressionStatement(expr)),
    );
  }
}
