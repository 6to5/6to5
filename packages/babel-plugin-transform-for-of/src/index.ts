import { declare } from "@babel/helper-plugin-utils";
import { template, types as t } from "@babel/core";

import transformWithoutHelper from "./no-helper-implementation";

export default declare((api, options) => {
  api.assertVersion(7);

  {
    const { assumeArray, allowArrayLike, loose } = options;

    if (loose === true && assumeArray === true) {
      throw new Error(
        `The loose and assumeArray options cannot be used together in @babel/plugin-transform-for-of`,
      );
    }

    if (assumeArray === true && allowArrayLike === true) {
      throw new Error(
        `The assumeArray and allowArrayLike options cannot be used together in @babel/plugin-transform-for-of`,
      );
    }

    // TODO: Remove in Babel 8
    if (allowArrayLike && /^7\.\d\./.test(api.version)) {
      throw new Error(
        `The allowArrayLike is only supported when using @babel/core@^7.10.0`,
      );
    }
  }

  const iterableIsArray =
    options.assumeArray ??
    // Loose mode is not compatible with 'assumeArray', so we shouldn't read
    // 'iterableIsArray' if 'loose' is true.
    (!options.loose && api.assumption("iterableIsArray"));

  const arrayLikeIsIterable =
    options.allowArrayLike ?? api.assumption("arrayLikeIsIterable");

  const skipteratorClosing =
    api.assumption("skipForOfIteratorClosing") ?? options.loose;

  if (iterableIsArray && arrayLikeIsIterable) {
    throw new Error(
      `The "iterableIsArray" and "arrayLikeIsIterable" assumptions are not compatible.`,
    );
  }

  if (iterableIsArray) {
    return {
      name: "transform-for-of",

      visitor: {
        ForOfStatement(path) {
          const { scope } = path;
          const { left, right, await: isAwait } = path.node;
          if (isAwait) {
            return;
          }
          const i = scope.generateUidIdentifier("i");
          let array = scope.maybeGenerateMemoised(right, true);

          const inits = [t.variableDeclarator(i, t.numericLiteral(0))];
          if (array) {
            inits.push(t.variableDeclarator(array, right));
          } else {
            array = right;
          }

          const item = t.memberExpression(
            t.cloneNode(array),
            t.cloneNode(i),
            true,
          );
          let assignment;
          if (t.isVariableDeclaration(left)) {
            assignment = left;
            assignment.declarations[0].init = item;
          } else {
            assignment = t.expressionStatement(
              t.assignmentExpression("=", left, item),
            );
          }

          let blockBody;
          const body = path.get("body");
          if (
            body.isBlockStatement() &&
            Object.keys(path.getBindingIdentifiers()).some(id =>
              body.scope.hasOwnBinding(id),
            )
          ) {
            blockBody = t.blockStatement([assignment, body.node]);
          } else {
            blockBody = t.toBlock(body.node);
            blockBody.body.unshift(assignment);
          }

          path.replaceWith(
            t.forStatement(
              t.variableDeclaration("let", inits),
              t.binaryExpression(
                "<",
                t.cloneNode(i),
                t.memberExpression(t.cloneNode(array), t.identifier("length")),
              ),
              t.updateExpression("++", t.cloneNode(i)),
              blockBody,
            ),
          );
        },
      },
    };
  }

  const buildForOfArray = template`
    for (var KEY = 0, NAME = ARR; KEY < NAME.length; KEY++) BODY;
  `;

  const buildForOfNoIteratorClosing = template.statements`
    for (var ITERATOR_HELPER = CREATE_ITERATOR_HELPER(OBJECT, ARRAY_LIKE_IS_ITERABLE), STEP_KEY;
        !(STEP_KEY = ITERATOR_HELPER()).done;) BODY;
  `;

  const buildForOf = template.statements`
    var ITERATOR_HELPER = CREATE_ITERATOR_HELPER(OBJECT, ARRAY_LIKE_IS_ITERABLE), STEP_KEY;
    try {
      for (ITERATOR_HELPER.s(); !(STEP_KEY = ITERATOR_HELPER.n()).done;) BODY;
    } catch (err) {
      ITERATOR_HELPER.e(err);
    } finally {
      ITERATOR_HELPER.f();
    }
  `;

  const builder = skipteratorClosing
    ? {
        build: buildForOfNoIteratorClosing,
        helper: "createForOfIteratorHelperLoose",
        getContainer: nodes => nodes,
      }
    : {
        build: buildForOf,
        helper: "createForOfIteratorHelper",
        getContainer: nodes => nodes[1].block.body,
      };

  function _ForOfStatementArray(path) {
    const { node, scope } = path;

    const right = scope.generateUidIdentifierBasedOnNode(node.right, "arr");
    const iterationKey = scope.generateUidIdentifier("i");

    const loop = buildForOfArray({
      BODY: node.body,
      KEY: iterationKey,
      NAME: right,
      ARR: node.right,
    });

    t.inherits(loop, node);
    t.ensureBlock(loop);

    const iterationValue = t.memberExpression(
      t.cloneNode(right),
      t.cloneNode(iterationKey),
      true,
    );

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

    return loop;
  }

  return {
    name: "transform-for-of",
    visitor: {
      ForOfStatement(path, state) {
        const right = path.get("right");
        if (
          right.isArrayExpression() ||
          right.isGenericType("Array") ||
          t.isArrayTypeAnnotation(right.getTypeAnnotation())
        ) {
          path.replaceWith(_ForOfStatementArray(path));
          return;
        }

        if (!state.availableHelper(builder.helper)) {
          // Babel <7.9.0 doesn't support this helper
          transformWithoutHelper(skipteratorClosing, path, state);
          return;
        }

        const { node, parent, scope } = path;
        const left = node.left;
        let declar;

        const stepKey = scope.generateUid("step");
        const stepValue = t.memberExpression(
          t.identifier(stepKey),
          t.identifier("value"),
        );

        if (t.isVariableDeclaration(left)) {
          // for (let i of test)
          declar = t.variableDeclaration(left.kind, [
            t.variableDeclarator(left.declarations[0].id, stepValue),
          ]);
        } else {
          // for (i of test), for ({ i } of test)
          declar = t.expressionStatement(
            t.assignmentExpression("=", left, stepValue),
          );
        }

        // ensure that it's a block so we can take all its statements
        path.ensureBlock();

        node.body.body.unshift(declar);

        const nodes = builder.build({
          CREATE_ITERATOR_HELPER: state.addHelper(builder.helper),
          ITERATOR_HELPER: scope.generateUidIdentifier("iterator"),
          ARRAY_LIKE_IS_ITERABLE: arrayLikeIsIterable
            ? t.booleanLiteral(true)
            : null,
          STEP_KEY: t.identifier(stepKey),
          OBJECT: node.right,
          BODY: node.body,
        });
        const container = builder.getContainer(nodes);

        t.inherits(container[0], node);
        t.inherits(container[0].body, node.body);

        if (t.isLabeledStatement(parent)) {
          container[0] = t.labeledStatement(parent.label, container[0]);

          path.parentPath.replaceWithMultiple(nodes);

          // The parent has been replaced, prevent Babel from traversing a detatched path
          path.skip();
        } else {
          path.replaceWithMultiple(nodes);
        }
      },
    },
  };
});
