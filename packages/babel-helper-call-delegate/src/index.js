import hoistVariables from "babel-helper-hoist-variables";
import type { NodePath } from "babel-traverse";
import * as t from "babel-types";

const visitor = {
  enter(path, state) {
    if (path.isThisExpression()) {
      state.foundThis = true;
    }

    if (path.isReferencedIdentifier({ name: "arguments" })) {
      state.foundArguments = true;
    }
  },

  Function(path) {
    path.skip();
  },
};

export default function(path: NodePath, scope = path.scope) {
  const { node } = path;
  const container = t.functionExpression(
    null,
    [],
    node.body,
    node.generator,
    node.async,
  );

  let callee = container;
  let args = [];

  // todo: only hoist if necessary
  hoistVariables(path, id => scope.push({ id }));

  const state = {
    foundThis: false,
    foundArguments: false,
  };

  path.traverse(visitor, state);

  if (state.foundArguments) {
    callee = t.memberExpression(container, t.identifier("apply"));
    args = [];

    if (state.foundThis) {
      args.push(t.thisExpression());
    }

    if (state.foundArguments) {
      if (!state.foundThis) args.push(t.nullLiteral());
      args.push(t.identifier("arguments"));
    }
  }

  let call = t.callExpression(callee, args);
  if (node.generator) call = t.yieldExpression(call, true);

  return t.returnStatement(call);
}
