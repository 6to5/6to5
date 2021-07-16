import { types as t } from "@babel/core";

const topicReferenceReplacementVisitor = {
  TopicReference(path) {
    path.replaceWith(t.cloneNode(this.topicVariable));
  },
};

// This visitor traverses `BinaryExpression`
// and replaces any that use `|>`
// with sequence expressions containing assignment expressions
// with automatically generated variables,
// from inside to outside, from left to right.
export default {
  BinaryExpression: {
    exit(path) {
      const { scope, node } = path;

      if (node.operator !== "|>") {
        // The path node is a binary expression,
        // but it is not a pipe expression.
        return;
      }

      const topicVariable = scope.generateUidIdentifierBasedOnNode(node);
      const pipeBodyPath = path.get("right");

      scope.push({ id: topicVariable });

      if (pipeBodyPath.node.type === "TopicReference") {
        // If the pipe body is itself a lone topic reference,
        // then replace it with the topic variable.
        pipeBodyPath.replaceWith(t.cloneNode(topicVariable));
      } else {
        // Replace topic references with the topic variable.
        pipeBodyPath.traverse(topicReferenceReplacementVisitor, {
          topicVariable,
        });
      }

      // Replace the pipe expression itself with an assignment expression.
      path.replaceWith(
        t.sequenceExpression([
          t.assignmentExpression("=", t.cloneNode(topicVariable), node.left),
          node.right,
        ]),
      );
    },
  },
};
