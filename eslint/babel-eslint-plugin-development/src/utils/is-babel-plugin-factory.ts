import getReferenceOrigin from "./get-reference-origin";
import getExportName from "./get-export-name";

export default function isBabelPluginFactory(node, scope) {
  const { parent } = node;

  if (parent.type === "CallExpression") {
    const calleeOrigin = getReferenceOrigin(parent.callee, scope);

    // Using "declare" from "@babel/helper-plugin-utils"
    return !!(
      calleeOrigin &&
      calleeOrigin.kind === "import" &&
      calleeOrigin.name === "declare" &&
      calleeOrigin.source === "@babel/helper-plugin-utils"
    );
  }

  const exportName = getExportName(node);

  // export default function ({ types: t }) {}
  // module.exports = function ({ types: t }) {}
  return exportName === "default" || exportName === "module.exports";
}
