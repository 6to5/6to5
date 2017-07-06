import type { NodePath } from "babel-traverse";
import { visitors } from "babel-traverse";

import * as destructuring from "./destructuring";
import * as def from "./default";
import * as rest from "./rest";

export default function() {
  return {
    visitor: visitors.merge([
      {
        ArrowFunctionExpression(path) {
          // In some conversion cases, it may have already been converted to a function while this callback
          // was queued up.
          if (!path.isArrowFunctionExpression()) return;

          // default/rest visitors require access to `arguments`
          const params: Array<NodePath> = path.get("params");
          for (const param of params) {
            if (param.isRestElement() || param.isAssignmentPattern()) {
              path.arrowFunctionToExpression();
              break;
            }
          }
        },
      },
      destructuring.visitor,
      rest.visitor,
      def.visitor,
    ]),
  };
}
