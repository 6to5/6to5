import type { NodePath } from "@babel/traverse";
import { isTransparentExprWrapper } from "@babel/helper-skip-transparent-expression-wrappers";
/**
 * Test if a NodePath will be cast to boolean when evaluated.
 * It respects transparent expression wrappers defined in
 * "@babel/helper-skip-transparent-expression-wrappers"
 *
 * @example
 * // returns true
 * const nodePathADotB = NodePath("if (a.b) {}").get("test"); // a.b
 * willPathCastToBoolean(nodePathADotB)
 * @example
 * // returns false
 * willPathCastToBoolean(NodePath("a.b"))
 * @param {NodePath} path
 * @returns {boolean}
 */
export function willPathCastToBoolean(path: NodePath): boolean {
  const maybeWrapped = findOutermostTransparentParent(path);
  const { node, parentPath } = maybeWrapped;
  if (parentPath.isLogicalExpression()) {
    const { operator, right } = parentPath.node;
    if (
      operator === "&&" ||
      operator === "||" ||
      (operator === "??" && node === right)
    ) {
      return willPathCastToBoolean(parentPath);
    }
  }
  if (parentPath.isSequenceExpression()) {
    const { expressions } = parentPath.node;
    if (expressions[expressions.length - 1] === node) {
      return willPathCastToBoolean(parentPath);
    } else {
      // if it is in the middle of a sequence expression, we don't
      // care the return value so just cast to boolean for smaller
      // output
      return true;
    }
  }
  return (
    parentPath.isConditional({ test: node }) ||
    parentPath.isUnaryExpression({ operator: "!" }) ||
    parentPath.isLoop({ test: node })
  );
}

/**
 * Return the outermost transparent expression wrapper of a given path,
 * otherwise returns path itself.
 * @example
 * const nodePathADotB = NodePath("(a.b as any)").get("expression"); // a.b
 * // returns NodePath("(a.b as any)")
 * findOutermostTransparentParent(nodePathADotB);
 * @param {NodePath} path
 * @returns {NodePath}
 */
export function findOutermostTransparentParent(path: NodePath): NodePath {
  let maybeWrapped = path;
  path.findParent(p => {
    if (!isTransparentExprWrapper(p.node)) return true;
    maybeWrapped = p;
  });
  return maybeWrapped;
}
