import { declare } from "@babel/helper-plugin-utils";
import syntaxFunctionSent from "@babel/plugin-syntax-function-sent";
import wrapFunction from "@babel/helper-wrap-function";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  const isFunctionSent = node =>
    t.isIdentifier(node.meta, { name: "function" }) &&
    t.isIdentifier(node.property, { name: "sent" });

  const hasBeenReplaced = (node, sentId) =>
    t.isAssignmentExpression(node) &&
    t.isIdentifier(node.left, { name: sentId });

  const yieldVisitor = {
    Function(path) {
      path.skip();
    },

    YieldExpression(path) {
      if (!hasBeenReplaced(path.parent, this.sentId)) {
        path.replaceWith(
          t.assignmentExpression("=", t.identifier(this.sentId), path.node),
        );
      }
    },

    MetaProperty(path) {
      if (isFunctionSent(path.node)) {
        path.replaceWith(t.identifier(this.sentId));
      }
    },
  };

  return {
    name: "proposal-function-sent",
    inherits: syntaxFunctionSent,

    visitor: {
      MetaProperty(path, state) {
        if (!isFunctionSent(path.node)) return;

        const fnPath = path.getFunctionParent();

        if (!fnPath.node.generator) {
          throw new Error("Parent generator function not found");
        }

        const sentId = path.scope.generateUid("function.sent");

        fnPath.traverse(yieldVisitor, { sentId });
        fnPath.node.body.body.unshift(
          t.variableDeclaration("let", [
            t.variableDeclarator(t.identifier(sentId), t.yieldExpression()),
          ]),
        );

        wrapFunction(fnPath, state.addHelper("skipFirstGeneratorNext"));
      },
    },
  };
});
