export default function getExportName(node) {
  const { parent } = node;

  if (parent.type === "ExportDefaultDeclaration") {
    return "default";
  }

  if (parent.type === "ExportNamedDeclaration") {
    return node.id.name;
  }

  if (
    parent.type === "AssignmentExpression" &&
    parent.left.type === "MemberExpression" &&
    parent.left.object.type === "Identifier" &&
    parent.left.object.name === "module" &&
    parent.left.property.type === "Identifier" &&
    parent.left.property.name === "exports"
  ) {
    return "module.exports";
  }
}
