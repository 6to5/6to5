import eslint from "eslint";
import ruleExtender from "../utils/rule-extender";

const noInvalidThisRule = new eslint.Linter().getRules().get("no-invalid-this");

function isClassMember(node) {
  return (
    node.type === "ClassPrivateMethod" ||
    node.type === "ClassPrivateProperty" ||
    node.type === "ClassProperty"
  );
}

export default ruleExtender(noInvalidThisRule, {
  metaOverrides: {
    docs: {
      url:
        "https://github.com/babel/babel/tree/main/eslint/babel-eslint-plugin",
    },
  },
  createAdditionalVisitors(context) {
    // The strict check in the original rule relies on ClassBody
    // nodes being in strict mode. When the whole module isn't
    // in strict mode, we need to do an extra check here.
    if (context.parserOptions.sourceType === "script") {
      return {
        "ClassProperty[computed=true] ThisExpression"(node) {
          let nodeToCheck = node;

          while (nodeToCheck) {
            if (nodeToCheck.type === "ClassProperty") {
              break;
            }

            // Is descendent of the key node.
            if (nodeToCheck.parent && nodeToCheck.parent.key === nodeToCheck) {
              context.report({
                node,
                messageId: "unexpectedThis",
              });
              break;
            }

            nodeToCheck = nodeToCheck.parent;
          }
        },
      };
    }

    return {};
  },
  reportOverrides(reportData) {
    let node = reportData.node;

    while (node) {
      if (
        node.parent &&
        isClassMember(node.parent) &&
        node.parent.computed &&
        node.parent.key === node
      ) {
        return true;
      }

      if (isClassMember(node)) {
        return false;
      }

      node = node.parent;
    }

    return true;
  },
});
