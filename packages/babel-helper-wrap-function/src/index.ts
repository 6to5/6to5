import type { NodePath } from "@babel/traverse";
import nameFunction from "@babel/helper-function-name";
import template from "@babel/template";
import * as t from "@babel/types";

const buildAnonymousExpressionWrapper = template.expression(`
  (function () {
    var REF = FUNCTION;
    return function NAME(PARAMS) {
      return REF.apply(this, arguments);
    };
  })()
`);

const buildNamedExpressionWrapper = template.expression(`
  (function () {
    var REF = FUNCTION;
    function NAME(PARAMS) {
      return REF.apply(this, arguments);
    }
    return NAME;
  })()
`);

const buildDeclarationWrapper = template(`
  function NAME(PARAMS) { return REF.apply(this, arguments); }
  function REF() {
    REF = FUNCTION;
    return REF.apply(this, arguments);
  }
`);

function classOrObjectMethod(path: NodePath, callId: Object) {
  const node = path.node;
  const body = node.body;

  const container = t.functionExpression(
    null,
    [],
    t.blockStatement(body.body),
    true,
  );
  body.body = [
    t.returnStatement(
      t.callExpression(t.callExpression(callId, [container]), []),
    ),
  ];

  // Regardless of whether or not the wrapped function is a an async method
  // or generator the outer function should not be
  node.async = false;
  node.generator = false;

  // Unwrap the wrapper IIFE's environment so super and this and such still work.
  path
    .get("body.body.0.argument.callee.arguments.0")
    .unwrapFunctionEnvironment();
}

function plainFunction(path: NodePath, callId: Object, noNewArrows: boolean) {
  const node = path.node;
  const isDeclaration = path.isFunctionDeclaration();
  const functionId = node.id;
  const wrapper = isDeclaration
    ? buildDeclarationWrapper
    : functionId
    ? buildNamedExpressionWrapper
    : buildAnonymousExpressionWrapper;

  if (path.isArrowFunctionExpression()) {
    path.arrowFunctionToExpression({ noNewArrows });
  }

  node.id = null;

  if (isDeclaration) {
    node.type = "FunctionExpression";
  }

  const built = t.callExpression(callId, [node]);
  const container = wrapper({
    NAME: functionId || null,
    REF: path.scope.generateUidIdentifier(functionId ? functionId.name : "ref"),
    FUNCTION: built,
    PARAMS: node.params.reduce(
      (acc, param) => {
        acc.done =
          acc.done || t.isAssignmentPattern(param) || t.isRestElement(param);

        if (!acc.done) {
          acc.params.push(path.scope.generateUidIdentifier("x"));
        }

        return acc;
      },
      {
        params: [],
        done: false,
      },
    ).params,
  });

  if (isDeclaration) {
    path.replaceWith(container[0]);
    path.insertAfter(container[1]);
  } else {
    const retFunction = container.callee.body.body[1].argument;
    if (!functionId) {
      nameFunction({
        node: retFunction,
        parent: path.parent,
        scope: path.scope,
      });
    }

    if (!retFunction || retFunction.id || node.params.length) {
      // we have an inferred function id or params so we need this wrapper
      path.replaceWith(container);
    } else {
      // we can omit this wrapper as the conditions it protects for do not apply
      path.replaceWith(built);
    }
  }
}

export default function wrapFunction(
  path: NodePath,
  callId: Object,
  // TODO(Babel 8): Consider defaulting to false for spec compliancy
  noNewArrows: boolean = true,
) {
  if (path.isMethod()) {
    classOrObjectMethod(path, callId);
  } else {
    plainFunction(path, callId, noNewArrows);
  }
}
