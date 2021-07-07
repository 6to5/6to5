import { declare } from "@babel/helper-plugin-utils";
import syntaxPartialApplication from "@babel/plugin-syntax-partial-application";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  /**
   * a function to figure out if a call expression has
   * ArgumentPlaceholder as one of its arguments
   * @param node a callExpression node
   * @returns boolean
   */
  function hasArgumentPlaceholder(node) {
    return node.arguments.some(arg => t.isArgumentPlaceholder(arg));
  }

  function unwrapArguments(node, scope) {
    const init = [];
    for (let i = 0; i < node.arguments.length; i++) {
      if (
        !t.isArgumentPlaceholder(node.arguments[i]) &&
        !t.isImmutable(node.arguments[i])
      ) {
        const id = scope.generateUidIdentifierBasedOnNode(
          node.arguments[i],
          "param",
        );
        scope.push({ id });
        if (t.isSpreadElement(node.arguments[i])) {
          init.push(
            t.assignmentExpression(
              "=",
              t.cloneNode(id),
              t.arrayExpression([t.spreadElement(node.arguments[i].argument)]),
            ),
          );
          node.arguments[i].argument = t.cloneNode(id);
        } else {
          init.push(
            t.assignmentExpression("=", t.cloneNode(id), node.arguments[i]),
          );
          node.arguments[i] = t.cloneNode(id);
        }
      }
    }
    return init;
  }

  function replacePlaceholders(node, scope) {
    const placeholders = [];
    const args = [];

    node.arguments.forEach(arg => {
      if (t.isArgumentPlaceholder(arg)) {
        const id = scope.generateUid("_argPlaceholder");
        placeholders.push(t.identifier(id));
        args.push(t.identifier(id));
      } else {
        args.push(arg);
      }
    });
    return [placeholders, args];
  }

  return {
    name: "proposal-partial-application",
    inherits: syntaxPartialApplication,

    visitor: {
      CallExpression(path) {
        if (!hasArgumentPlaceholder(path.node)) {
          return;
        }
        const { node, scope } = path;
        const functionLVal = path.scope.generateUidIdentifierBasedOnNode(
          node.callee,
        );
        const sequenceParts = [];
        const argsInitializers = unwrapArguments(node, scope);
        const [placeholdersParams, args] = replacePlaceholders(node, scope);

        scope.push({ id: functionLVal });

        if (node.callee.type === "MemberExpression") {
          const receiverLVal = path.scope.generateUidIdentifierBasedOnNode(
            node.callee.object,
          );
          scope.push({ id: receiverLVal });
          sequenceParts.push(
            t.assignmentExpression(
              "=",
              t.cloneNode(receiverLVal),
              node.callee.object,
            ),
            t.assignmentExpression(
              "=",
              t.cloneNode(functionLVal),
              t.memberExpression(
                t.cloneNode(receiverLVal),
                node.callee.property,
              ),
            ),
            ...argsInitializers,
            t.functionExpression(
              t.cloneNode(node.callee.property),
              placeholdersParams,
              t.blockStatement(
                [
                  t.returnStatement(
                    t.callExpression(
                      t.memberExpression(
                        t.cloneNode(functionLVal),
                        t.identifier("call"),
                      ),
                      [t.cloneNode(receiverLVal), ...args],
                    ),
                  ),
                ],
                [],
              ),
              false,
              false,
            ),
          );
        } else {
          sequenceParts.push(
            t.assignmentExpression("=", t.cloneNode(functionLVal), node.callee),
            ...argsInitializers,
            t.functionExpression(
              t.cloneNode(node.callee),
              placeholdersParams,
              t.blockStatement(
                [
                  t.returnStatement(
                    t.callExpression(t.cloneNode(functionLVal), args),
                  ),
                ],
                [],
              ),
              false,
              false,
            ),
          );
        }
        path.replaceWith(t.sequenceExpression(sequenceParts));
      },
    },
  };
});
