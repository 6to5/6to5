import ruleComposer from "eslint-rule-composer";
import eslint from "eslint";

const rule = new eslint.Linter().getRules().get("object-curly-spacing");

export default ruleComposer.filterReports(rule, problem => {
  const node = problem.node;

  // Allow exportDefaultFrom syntax:
  // export x from '...';
  if (
    node.type === "ExportNamedDeclaration" &&
    node.specifiers.length === 1 &&
    node.specifiers[0].type === "ExportDefaultSpecifier"
  ) {
    return false;
  }

  return true;
});
