// @flow

import type NodePath from "babel-traverse";

export default function() {
  return {
    visitor: {
      ArrowFunctionExpression(
        path: NodePath<BabelNodeArrowFunctionExpression>,
        state: Object,
      ) {
        // In some conversion cases, it may have already been converted to a function while this callback
        // was queued up.
        if (!path.isArrowFunctionExpression()) return;

        path.arrowFunctionToExpression({
          // While other utils may be fine inserting other arrows to make more transforms possible,
          // the arrow transform itself absolutely cannot insert new arrow functions.
          allowInsertArrow: false,
          specCompliant: !!state.opts.spec,
        });
      },
    },
  };
}
