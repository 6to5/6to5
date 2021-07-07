import { types as t } from "@babel/core";
import buildOptimizedSequenceExpression from "./buildOptimizedSequenceExpression";

const fsharpVisitor = {
  BinaryExpression(path) {
    const { scope, node } = path;
    const { operator, left, right } = node;
    if (operator !== "|>") return;

    const placeholder = scope.generateUidIdentifierBasedOnNode(left);

    const call =
      right.type === "AwaitExpression"
        ? t.awaitExpression(t.cloneNode(placeholder))
        : t.callExpression(right, [t.cloneNode(placeholder)]);
    const sequence = buildOptimizedSequenceExpression({
      assign: t.assignmentExpression("=", t.cloneNode(placeholder), left),
      call,
      path,
    });
    path.replaceWith(sequence);
  },
};

export default fsharpVisitor;
