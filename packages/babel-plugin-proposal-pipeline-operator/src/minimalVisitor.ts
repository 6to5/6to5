import { types as t } from "@babel/core";
import buildOptimizedSequenceExpression from "./buildOptimizedSequenceExpression";

const minimalVisitor = {
  BinaryExpression(path) {
    const { scope, node } = path;
    const { operator, left, right } = node;
    if (operator !== "|>") return;

    const placeholder = scope.generateUidIdentifierBasedOnNode(left);

    const call = t.callExpression(right, [t.cloneNode(placeholder)]);
    path.replaceWith(
      buildOptimizedSequenceExpression({
        assign: t.assignmentExpression("=", t.cloneNode(placeholder), left),
        call,
        path,
      }),
    );
  },
};

export default minimalVisitor;
