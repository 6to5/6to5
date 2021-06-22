import { template, types as t } from "@babel/core";

// This is the legacy implementation, which inlines all the code.
// It must be kept for compatibility reasons.
// TODO (Babel 8): Remove this code.

export default function transformWithoutHelper(loose, path, state) {
  const pushComputedProps = loose
    ? pushComputedPropsLoose
    : pushComputedPropsSpec;

  const { node } = path;
  const build = pushComputedProps(path, state);
  const declar = build.declar;
  const loop = build.loop;
  const block = loop.body;

  // ensure that it's a block so we can take all its statements
  path.ensureBlock();

  // add the value declaration to the new loop body
  if (declar) {
    block.body.push(declar);
  }

  // push the rest of the original loop body onto our new body
  block.body = block.body.concat(node.body.body);

  t.inherits(loop, node);
  t.inherits(loop.body, node.body);

  if (build.replaceParent) {
    path.parentPath.replaceWithMultiple(build.node);
    path.remove();
  } else {
    path.replaceWithMultiple(build.node);
  }
}

const buildForOfLoose = template(`
  for (var LOOP_OBJECT = OBJECT,
          IS_ARRAY = Array.isArray(LOOP_OBJECT),
          INDEX = 0,
          LOOP_OBJECT = IS_ARRAY ? LOOP_OBJECT : LOOP_OBJECT[Symbol.iterator]();;) {
    INTERMEDIATE;
    if (IS_ARRAY) {
      if (INDEX >= LOOP_OBJECT.length) break;
      ID = LOOP_OBJECT[INDEX++];
    } else {
      INDEX = LOOP_OBJECT.next();
      if (INDEX.done) break;
      ID = INDEX.value;
    }
  }
`);

const buildForOf = template(`
  var ITERATOR_COMPLETION = true;
  var ITERATOR_HAD_ERROR_KEY = false;
  var ITERATOR_ERROR_KEY = undefined;
  try {
    for (
      var ITERATOR_KEY = OBJECT[Symbol.iterator](), STEP_KEY;
      !(ITERATOR_COMPLETION = (STEP_KEY = ITERATOR_KEY.next()).done);
      ITERATOR_COMPLETION = true
    ) {}
  } catch (err) {
    ITERATOR_HAD_ERROR_KEY = true;
    ITERATOR_ERROR_KEY = err;
  } finally {
    try {
      if (!ITERATOR_COMPLETION && ITERATOR_KEY.return != null) {
        ITERATOR_KEY.return();
      }
    } finally {
      if (ITERATOR_HAD_ERROR_KEY) {
        throw ITERATOR_ERROR_KEY;
      }
    }
  }
`);

function pushComputedPropsLoose(path, file) {
  const { node, scope, parent } = path;
  const { left } = node;
  let declar, id, intermediate;

  if (t.isIdentifier(left) || t.isPattern(left) || t.isMemberExpression(left)) {
    // for (i of test), for ({ i } of test)
    id = left;
    intermediate = null;
  } else if (t.isVariableDeclaration(left)) {
    // for (let i of test)
    id = scope.generateUidIdentifier("ref");
    declar = t.variableDeclaration(left.kind, [
      t.variableDeclarator(left.declarations[0].id, t.identifier(id.name)),
    ]);
    intermediate = t.variableDeclaration("var", [
      t.variableDeclarator(t.identifier(id.name)),
    ]);
  } else {
    throw file.buildCodeFrameError(
      left,
      `Unknown node type ${left.type} in ForStatement`,
    );
  }

  const iteratorKey = scope.generateUidIdentifier("iterator");
  const isArrayKey = scope.generateUidIdentifier("isArray");

  const loop = buildForOfLoose({
    LOOP_OBJECT: iteratorKey,
    IS_ARRAY: isArrayKey,
    OBJECT: node.right,
    INDEX: scope.generateUidIdentifier("i"),
    ID: id,
    INTERMEDIATE: intermediate,
  });

  //
  const isLabeledParent = t.isLabeledStatement(parent);
  let labeled;

  if (isLabeledParent) {
    labeled = t.labeledStatement(parent.label, loop);
  }

  return {
    replaceParent: isLabeledParent,
    declar: declar,
    node: labeled || loop,
    loop: loop,
  };
}

function pushComputedPropsSpec(path, file) {
  const { node, scope, parent } = path;
  const left = node.left;
  let declar;

  const stepKey = scope.generateUid("step");
  const stepValue = t.memberExpression(
    t.identifier(stepKey),
    t.identifier("value"),
  );

  if (t.isIdentifier(left) || t.isPattern(left) || t.isMemberExpression(left)) {
    // for (i of test), for ({ i } of test)
    declar = t.expressionStatement(
      t.assignmentExpression("=", left, stepValue),
    );
  } else if (t.isVariableDeclaration(left)) {
    // for (let i of test)
    declar = t.variableDeclaration(left.kind, [
      t.variableDeclarator(left.declarations[0].id, stepValue),
    ]);
  } else {
    throw file.buildCodeFrameError(
      left,
      `Unknown node type ${left.type} in ForStatement`,
    );
  }

  const template = buildForOf({
    ITERATOR_HAD_ERROR_KEY: scope.generateUidIdentifier("didIteratorError"),
    ITERATOR_COMPLETION: scope.generateUidIdentifier(
      "iteratorNormalCompletion",
    ),
    ITERATOR_ERROR_KEY: scope.generateUidIdentifier("iteratorError"),
    ITERATOR_KEY: scope.generateUidIdentifier("iterator"),
    STEP_KEY: t.identifier(stepKey),
    OBJECT: node.right,
  });

  const isLabeledParent = t.isLabeledStatement(parent);

  const tryBody = template[3].block.body;
  const loop = tryBody[0];

  if (isLabeledParent) {
    tryBody[0] = t.labeledStatement(parent.label, loop);
  }

  //

  return {
    replaceParent: isLabeledParent,
    declar: declar,
    loop: loop,
    node: template,
  };
}
