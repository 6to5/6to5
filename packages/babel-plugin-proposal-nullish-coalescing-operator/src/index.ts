import { declare } from "@babel/helper-plugin-utils";
import syntaxNullishCoalescingOperator from "@babel/plugin-syntax-nullish-coalescing-operator";
import { types as t, template } from "@babel/core";

export default declare((api, { loose = false }) => {
  api.assertVersion(7);
  const noDocumentAll = api.assumption("noDocumentAll") ?? loose;

  return {
    name: "proposal-nullish-coalescing-operator",
    inherits: syntaxNullishCoalescingOperator.default,

    visitor: {
      LogicalExpression(path) {
        const { node, scope } = path;
        if (node.operator !== "??") {
          return;
        }

        let ref;
        let assignment;
        // skip creating extra reference when `left` is static
        if (scope.isStatic(node.left)) {
          ref = node.left;
          assignment = t.cloneNode(node.left);
        } else if (scope.path.isPattern()) {
          // Replace `function (a, x = a.b ?? c) {}` to `function (a, x = (() => a.b ?? c)() ){}`
          // so the temporary variable can be injected in correct scope
          path.replaceWith(template.ast`(() => ${path.node})()`);
          // The injected nullish expression will be queued and eventually transformed when visited
          return;
        } else {
          ref = scope.generateUidIdentifierBasedOnNode(node.left);
          scope.push({ id: t.cloneNode(ref) });
          assignment = t.assignmentExpression("=", ref, node.left);
        }

        path.replaceWith(
          t.conditionalExpression(
            // We cannot use `!= null` in spec mode because
            // `document.all == null` and `document.all` is not "nullish".
            noDocumentAll
              ? t.binaryExpression("!=", assignment, t.nullLiteral())
              : t.logicalExpression(
                  "&&",
                  t.binaryExpression("!==", assignment, t.nullLiteral()),
                  t.binaryExpression(
                    "!==",
                    t.cloneNode(ref),
                    scope.buildUndefinedNode(),
                  ),
                ),
            t.cloneNode(ref),
            node.right,
          ),
        );
      },
    },
  };
});
