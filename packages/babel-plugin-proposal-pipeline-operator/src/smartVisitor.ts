import { types as t } from "@babel/core";

const updateTopicReferenceVisitor = {
  PipelinePrimaryTopicReference(path) {
    path.replaceWith(t.cloneNode(this.topicId));
  },
  PipelineTopicExpression(path) {
    path.skip();
  },
};

const smartVisitor = {
  BinaryExpression(path) {
    const { scope } = path;
    const { node } = path;
    const { operator, left, right } = node;
    if (operator !== "|>") return;

    const placeholder = scope.generateUidIdentifierBasedOnNode(left);
    scope.push({ id: placeholder });

    let call;
    if (t.isPipelineTopicExpression(right)) {
      path
        .get("right")
        .traverse(updateTopicReferenceVisitor, { topicId: placeholder });

      call = right.expression;
    } else {
      // PipelineBareFunction
      let callee = right.callee;
      if (t.isIdentifier(callee, { name: "eval" })) {
        callee = t.sequenceExpression([t.numericLiteral(0), callee]);
      }

      call = t.callExpression(callee, [t.cloneNode(placeholder)]);
    }

    path.replaceWith(
      t.sequenceExpression([
        t.assignmentExpression("=", t.cloneNode(placeholder), left),
        call,
      ]),
    );
  },
};

export default smartVisitor;
