import getReferenceOrigin from "../utils/get-reference-origin";
import isFromBabelTypes from "../utils/is-from-babel-types";

export default {
  meta: {
    schema: [],
    fixable: "code",
  },
  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node;
        const scope = context.getScope();

        const origin = getReferenceOrigin(callee, scope);
        if (!origin) return;

        const { name } = origin;
        if (
          (name === "clone" || name === "cloneDeep") &&
          isFromBabelTypes(origin, scope)
        ) {
          const isMemberExpression = callee.type === "MemberExpression";
          const id = isMemberExpression ? callee.property : callee;

          context.report({
            node: id,
            message: `t.${name}() is deprecated. Use t.cloneNode() instead.`,
            fix(fixer) {
              if (isMemberExpression) {
                return fixer.replaceText(id, "cloneNode");
              }
            },
          });
        }
      },
    };
  },
};
