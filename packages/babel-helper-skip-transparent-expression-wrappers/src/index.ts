// @flow

import * as t from "@babel/types";
import type { NodePath } from "@babel/traverse";

// A transparent expression wrapper is an AST node that most plugins will wish
// to skip, as its presence does not affect the behaviour of the code. This
// includes expressions used for types, and extra parenthesis. For example, in
// (a as any)(), this helper can be used to skip the TSAsExpression when
// determining the callee.
export function isTransparentExprWrapper(node: Node) {
  return (
    t.isTSAsExpression(node) ||
    t.isTSTypeAssertion(node) ||
    t.isTSNonNullExpression(node) ||
    t.isTypeCastExpression(node) ||
    t.isParenthesizedExpression(node)
  );
}

export function skipTransparentExprWrappers(path: NodePath): NodePath {
  while (isTransparentExprWrapper(path.node)) {
    path = path.get("expression");
  }

  return path;
}
