import { template, types as t } from "@babel/core";

export default function privateOptionalChain() {
  return {
    OptionalMemberExpression(path) {
      let hasPrivate = false;
      let base = path;
      do {
        if (base.isOptionalCallExpression()) {
          base = base.get("callee");
        } else if (base.isOptionalMemberExpression()) {
          if (base.get("property").isPrivateName()) {
            hasPrivate = true;
          }
          base = base.get("object");
        }
      } while (!base.parent.optional);

      if (!hasPrivate) return;

      const tmpId = path.scope.generateUidBasedOnNode(base.node);
      const id = () => t.identifier(tmpId);
      path.scope.push({ id: id() });

      const obj = base.node;
      let memberExpr = id();
      do {
        base = base.parentPath;
        memberExpr = t.memberExpression(
          memberExpr,
          base.node.property,
          base.node.computed,
        );
      } while (base.node !== path.node);

      path.replaceWith(template.expression.ast`
        (${id()} = ${obj}) === null || ${id()} === void 0 ? void 0 : ${memberExpr}
      `);
    },
  };
}
