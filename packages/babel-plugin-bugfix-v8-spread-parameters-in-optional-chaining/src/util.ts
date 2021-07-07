import { skipTransparentExprWrappers } from "@babel/helper-skip-transparent-expression-wrappers";
import type { NodePath } from "@babel/traverse";
import { types as t } from "@babel/core";
// https://crbug.com/v8/11558

// check if there is a spread element followed by another argument.
// (...[], 0) or (...[], ...[])

function matchAffectedArguments(argumentNodes) {
  const spreadIndex = argumentNodes.findIndex(node => t.isSpreadElement(node));
  return spreadIndex >= 0 && spreadIndex !== argumentNodes.length - 1;
}

/**
 * Check whether the optional chain is affected by https://crbug.com/v8/11558.
 * This routine MUST not manipulate NodePath
 *
 * @export
 * @param {(NodePath<t.OptionalMemberExpression | t.OptionalCallExpression>)} path
 * @returns {boolean}
 */
export function shouldTransform(
  path: NodePath<t.OptionalMemberExpression | t.OptionalCallExpression>,
): boolean {
  let optionalPath = path;
  const chains = [];
  while (
    optionalPath.isOptionalMemberExpression() ||
    optionalPath.isOptionalCallExpression()
  ) {
    const { node } = optionalPath;
    chains.push(node);

    if (optionalPath.isOptionalMemberExpression()) {
      // @ts-expect-error todo(flow->ts)
      optionalPath = skipTransparentExprWrappers(optionalPath.get("object"));
    } else if (optionalPath.isOptionalCallExpression()) {
      // @ts-expect-error todo(flow->ts)
      optionalPath = skipTransparentExprWrappers(optionalPath.get("callee"));
    }
  }
  for (let i = 0; i < chains.length; i++) {
    const node = chains[i];
    if (
      t.isOptionalCallExpression(node) &&
      matchAffectedArguments(node.arguments)
    ) {
      // f?.(...[], 0)
      if (node.optional) {
        return true;
      }
      // o?.m(...[], 0)
      // when node.optional is false, chains[i + 1] is always well defined
      const callee = chains[i + 1];
      if (t.isOptionalMemberExpression(callee, { optional: true })) {
        return true;
      }
    }
  }
  return false;
}
