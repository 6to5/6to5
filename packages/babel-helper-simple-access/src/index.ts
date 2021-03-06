import * as t from "@babel/types";
import type { NodePath } from "@babel/traverse";

export default function simplifyAccess(path: NodePath, bindingNames) {
  path.traverse(simpleAssignmentVisitor, {
    scope: path.scope,
    bindingNames,
    seen: new WeakSet(),
  });
}

const simpleAssignmentVisitor = {
  UpdateExpression: {
    exit(path) {
      const { scope, bindingNames } = this;

      const arg = path.get("argument");
      if (!arg.isIdentifier()) return;
      const localName = arg.node.name;

      if (!bindingNames.has(localName)) return;

      // redeclared in this scope
      if (scope.getBinding(localName) !== path.scope.getBinding(localName)) {
        return;
      }

      if (
        path.parentPath.isExpressionStatement() &&
        !path.isCompletionRecord()
      ) {
        // ++i => (i += 1);
        const operator = path.node.operator == "++" ? "+=" : "-=";
        path.replaceWith(
          t.assignmentExpression(operator, arg.node, t.numericLiteral(1)),
        );
      } else if (path.node.prefix) {
        // ++i => (i = (+i) + 1);
        path.replaceWith(
          t.assignmentExpression(
            "=",
            t.identifier(localName),
            t.binaryExpression(
              path.node.operator[0],
              t.unaryExpression("+", arg.node),
              t.numericLiteral(1),
            ),
          ),
        );
      } else {
        const old = path.scope.generateUidIdentifierBasedOnNode(
          arg.node,
          "old",
        );
        const varName = old.name;
        path.scope.push({ id: old });

        const binary = t.binaryExpression(
          path.node.operator[0],
          t.identifier(varName),
          t.numericLiteral(1),
        );

        // i++ => (_old = (+i), i = _old + 1, _old)
        path.replaceWith(
          t.sequenceExpression([
            t.assignmentExpression(
              "=",
              t.identifier(varName),
              t.unaryExpression("+", arg.node),
            ),
            t.assignmentExpression("=", t.cloneNode(arg.node), binary),
            t.identifier(varName),
          ]),
        );
      }
    },
  },

  AssignmentExpression: {
    exit(path) {
      const { scope, seen, bindingNames } = this;

      if (path.node.operator === "=") return;

      if (seen.has(path.node)) return;
      seen.add(path.node);

      const left = path.get("left");
      if (!left.isIdentifier()) return;

      // Simple update-assign foo += 1;
      // =>   exports.foo =  (foo += 1);
      const localName = left.node.name;

      if (!bindingNames.has(localName)) return;

      // redeclared in this scope
      if (scope.getBinding(localName) !== path.scope.getBinding(localName)) {
        return;
      }

      const operator = path.node.operator.slice(0, -1);
      if (t.LOGICAL_OPERATORS.includes(operator)) {
        // &&, ||, ??
        // (foo &&= bar) => (foo && foo = bar)
        path.replaceWith(
          t.logicalExpression(
            operator,
            path.node.left,
            t.assignmentExpression(
              "=",
              t.cloneNode(path.node.left),
              path.node.right,
            ),
          ),
        );
      } else {
        // (foo += bar) => (foo = foo + bar)
        path.node.right = t.binaryExpression(
          operator,
          t.cloneNode(path.node.left),
          path.node.right,
        );
        path.node.operator = "=";
      }
    },
  },
};
