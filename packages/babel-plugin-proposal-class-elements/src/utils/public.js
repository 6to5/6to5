import { types as t } from "@babel/core";

export function buildPublicFieldInitSpec(ref, node, state) {
  const { key, computed, value } = node;

  return t.callExpression(state.addHelper("defineProperty"), [
    ref,
    computed || t.isLiteral(key) ? key : t.stringLiteral(key.name),
    value ?? t.unaryExpression("void", t.numericLiteral(0)),
  ]);
}
