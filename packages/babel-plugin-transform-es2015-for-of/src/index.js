export default function({ messages, template, types: t }) {
  const isArrayFrom = t.buildMatchMemberExpression("Array.from");
  const isObjectKeys = t.buildMatchMemberExpression("Object.keys");
  const isObjectValues = t.buildMatchMemberExpression("Object.values");
  const isObjectEntries = t.buildMatchMemberExpression("Object.entries");

  const buildForOfArray = template(`
    for (var KEY = 0; KEY < ARR.length; KEY++) BODY;
  `);

  const buildForOfLoose = template(`
    for (var LOOP_OBJECT = OBJECT,
             IS_ARRAY = Array.isArray(LOOP_OBJECT),
             INDEX = 0,
             LOOP_OBJECT = IS_ARRAY ? LOOP_OBJECT : LOOP_OBJECT[Symbol.iterator]();;) {
      var ID;
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

  /* eslint-disable max-len */
  const buildForOf = template(`
    var ITERATOR_COMPLETION = true;
    var ITERATOR_HAD_ERROR_KEY = false;
    var ITERATOR_ERROR_KEY = undefined;
    try {
      for (var ITERATOR_KEY = OBJECT[Symbol.iterator](), STEP_KEY; !(ITERATOR_COMPLETION = (STEP_KEY = ITERATOR_KEY.next()).done); ITERATOR_COMPLETION = true) {
      }
    } catch (err) {
      ITERATOR_HAD_ERROR_KEY = true;
      ITERATOR_ERROR_KEY = err;
    } finally {
      try {
        if (!ITERATOR_COMPLETION && ITERATOR_KEY.return) {
          ITERATOR_KEY.return();
        }
      } finally {
        if (ITERATOR_HAD_ERROR_KEY) {
          throw ITERATOR_ERROR_KEY;
        }
      }
    }
  `);
  /* eslint-enable max-len */

  function _ForOfStatementArray(path) {
    const { node, scope } = path;
    const nodes = [];
    let right = node.right;

    if (!t.isIdentifier(right) || !scope.hasBinding(right.name)) {
      const uid = scope.generateUidIdentifier("arr");
      nodes.push(
        t.variableDeclaration("var", [t.variableDeclarator(uid, right)]),
      );
      right = uid;
    }

    const iterationKey = scope.generateUidIdentifier("i");

    let loop = buildForOfArray({
      BODY: node.body,
      KEY: iterationKey,
      ARR: right,
    });

    t.inherits(loop, node);
    t.ensureBlock(loop);

    const iterationValue = t.memberExpression(right, iterationKey, true);

    const left = node.left;
    if (t.isVariableDeclaration(left)) {
      left.declarations[0].init = iterationValue;
      loop.body.body.unshift(left);
    } else {
      loop.body.body.unshift(
        t.expressionStatement(
          t.assignmentExpression("=", left, iterationValue),
        ),
      );
    }

    if (path.parentPath.isLabeledStatement()) {
      loop = t.labeledStatement(path.parentPath.node.label, loop);
    }

    nodes.push(loop);

    return nodes;
  }

  function replaceWithArray(path) {
    if (path.parentPath.isLabeledStatement()) {
      path.parentPath.replaceWithMultiple(_ForOfStatementArray(path));
      return true;
    } else {
      path.replaceWithMultiple(_ForOfStatementArray(path));
      return true;
    }
    return false;
  }

  function optimize(path, right) {
    if (right.isArrayExpression() || right.isGenericType("Array")) {
      return replaceWithArray(path);
    } else if (right.isIdentifier() && right.isPure()) {
      const binding = path.scope.getBinding(right.node.name);
      return optimize(path, binding.path.get("init"));
    } else if (
      right.isCallExpression() &&
      (isArrayFrom(right.get("callee").node) ||
        isObjectKeys(right.get("callee").node) ||
        isObjectValues(right.get("callee").node) ||
        isObjectEntries(right.get("callee").node))
    ) {
      const initPath =
        right === path.get("right") ? path : right.find(p => p.isStatement());
      const uid = path.scope.generateUidIdentifierBasedOnNode(right.node);
      initPath.insertBefore(
        t.variableDeclaration("const", [t.variableDeclarator(uid, right.node)]),
      );
      right.replaceWith(uid);
      return replaceWithArray(path);
    }
    return false;
  }

  return {
    visitor: {
      ForOfStatement(path, state) {
        if (optimize(path, path.get("right"))) {
          return;
        }

        let callback = spec;
        if (state.opts.loose) callback = loose;

        const { node } = path;
        const build = callback(path, state);
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
      },
    },
  };

  function loose(path, file) {
    const { node, scope, parent } = path;
    const { left } = node;
    let declar, id;

    if (
      t.isIdentifier(left) ||
      t.isPattern(left) ||
      t.isMemberExpression(left)
    ) {
      // for (i of test), for ({ i } of test)
      id = left;
    } else if (t.isVariableDeclaration(left)) {
      // for (let i of test)
      id = scope.generateUidIdentifier("ref");
      declar = t.variableDeclaration(left.kind, [
        t.variableDeclarator(left.declarations[0].id, id),
      ]);
    } else {
      throw file.buildCodeFrameError(
        left,
        messages.get("unknownForHead", left.type),
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
    });

    if (!declar) {
      // no declaration so we need to remove the variable declaration at the top of
      // the for-of-loose template
      loop.body.body.shift();
    }

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

  function spec(path, file) {
    const { node, scope, parent } = path;
    const left = node.left;
    let declar;

    const stepKey = scope.generateUidIdentifier("step");
    const stepValue = t.memberExpression(stepKey, t.identifier("value"));

    if (
      t.isIdentifier(left) ||
      t.isPattern(left) ||
      t.isMemberExpression(left)
    ) {
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
        messages.get("unknownForHead", left.type),
      );
    }

    //

    const iteratorKey = scope.generateUidIdentifier("iterator");

    const template = buildForOf({
      ITERATOR_HAD_ERROR_KEY: scope.generateUidIdentifier("didIteratorError"),
      ITERATOR_COMPLETION: scope.generateUidIdentifier(
        "iteratorNormalCompletion",
      ),
      ITERATOR_ERROR_KEY: scope.generateUidIdentifier("iteratorError"),
      ITERATOR_KEY: iteratorKey,
      STEP_KEY: stepKey,
      OBJECT: node.right,
      BODY: null,
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
}
