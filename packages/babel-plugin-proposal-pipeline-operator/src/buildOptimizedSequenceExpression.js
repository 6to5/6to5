import { types as t } from "@babel/core";

// tries to optimize sequence expressions in the format
//   (a = b, (c => c + e)(a))
// to
//   (a = b, a + e)
const buildOptimizedSequenceExpression = ({ call, path, placeholder }) => {
  const { callee: calledExpression } = call;
  const pipelineLeft = path.node.left;
  const assign = t.assignmentExpression(
    "=",
    t.cloneNode(placeholder),
    pipelineLeft,
  );

  let optimizeArrow =
    t.isArrowFunctionExpression(calledExpression) &&
    t.isExpression(calledExpression.body) &&
    !calledExpression.async &&
    !calledExpression.generator;
  let param;

  if (optimizeArrow) {
    const { params } = calledExpression;
    if (params.length === 1 && t.isIdentifier(params[0])) {
      param = params[0];
    } else if (params.length > 0) {
      optimizeArrow = false;
    }
  } else if (t.isIdentifier(calledExpression, { name: "eval" })) {
    const evalSequence = t.sequenceExpression([
      t.numericLiteral(0),
      calledExpression,
    ]);

    call.callee = evalSequence;

    path.scope.push({ id: t.cloneNode(placeholder) });

    return t.sequenceExpression([assign, call]);
  }

  if (optimizeArrow && !param) {
    // Arrow function with 0 arguments
    return t.sequenceExpression([pipelineLeft, calledExpression.body]);
  }

  path.scope.push({ id: t.cloneNode(placeholder) });

  if (param) {
    path.get("right").scope.rename(param.name, placeholder.name);

    return t.sequenceExpression([assign, calledExpression.body]);
  }

  return t.sequenceExpression([assign, call]);
};

export default buildOptimizedSequenceExpression;
