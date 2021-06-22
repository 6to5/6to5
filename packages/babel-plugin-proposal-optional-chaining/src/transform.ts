import { types as t, template } from "@babel/core";
import {
  isTransparentExprWrapper,
  skipTransparentExprWrappers,
} from "@babel/helper-skip-transparent-expression-wrappers";
import { willPathCastToBoolean, findOutermostTransparentParent } from "./util";

const { ast } = template.expression;

function isSimpleMemberExpression(expression) {
  expression = skipTransparentExprWrappers(expression);
  return (
    t.isIdentifier(expression) ||
    t.isSuper(expression) ||
    (t.isMemberExpression(expression) &&
      !expression.computed &&
      isSimpleMemberExpression(expression.object))
  );
}

/**
 * Test if a given optional chain `path` needs to be memoized
 * @param {NodePath} path
 * @returns {boolean}
 */
function needsMemoize(path) {
  let optionalPath = path;
  const { scope } = path;
  while (
    optionalPath.isOptionalMemberExpression() ||
    optionalPath.isOptionalCallExpression()
  ) {
    const { node } = optionalPath;
    const childKey = optionalPath.isOptionalMemberExpression()
      ? "object"
      : "callee";
    const childPath = skipTransparentExprWrappers(optionalPath.get(childKey));
    if (node.optional) {
      return !scope.isStatic(childPath.node);
    }

    optionalPath = childPath;
  }
}

export function transform(
  path: NodePath<t.OptionalCallExpression | t.OptionalMemberExpression>,
  {
    pureGetters,
    noDocumentAll,
  }: { pureGetters: boolean, noDocumentAll: boolean },
) {
  const { scope } = path;
  // maybeWrapped points to the outermost transparent expression wrapper
  // or the path itself
  const maybeWrapped = findOutermostTransparentParent(path);
  const { parentPath } = maybeWrapped;
  const willReplacementCastToBoolean = willPathCastToBoolean(maybeWrapped);
  let isDeleteOperation = false;
  const parentIsCall =
    parentPath.isCallExpression({ callee: maybeWrapped.node }) &&
    // note that the first condition must implies that `path.optional` is `true`,
    // otherwise the parentPath should be an OptionalCallExpression
    path.isOptionalMemberExpression();

  const optionals = [];

  let optionalPath = path;
  // Replace `function (a, x = a.b?.c) {}` to `function (a, x = (() => a.b?.c)() ){}`
  // so the temporary variable can be injected in correct scope
  if (scope.path.isPattern() && needsMemoize(optionalPath)) {
    path.replaceWith(template.ast`(() => ${path.node})()`);
    // The injected optional chain will be queued and eventually transformed when visited
    return;
  }
  while (
    optionalPath.isOptionalMemberExpression() ||
    optionalPath.isOptionalCallExpression()
  ) {
    const { node } = optionalPath;
    if (node.optional) {
      optionals.push(node);
    }

    if (optionalPath.isOptionalMemberExpression()) {
      optionalPath.node.type = "MemberExpression";
      optionalPath = skipTransparentExprWrappers(optionalPath.get("object"));
    } else if (optionalPath.isOptionalCallExpression()) {
      optionalPath.node.type = "CallExpression";
      optionalPath = skipTransparentExprWrappers(optionalPath.get("callee"));
    }
  }

  let replacementPath = path;
  if (parentPath.isUnaryExpression({ operator: "delete" })) {
    replacementPath = parentPath;
    isDeleteOperation = true;
  }
  for (let i = optionals.length - 1; i >= 0; i--) {
    const node = optionals[i];

    const isCall = t.isCallExpression(node);
    const replaceKey = isCall ? "callee" : "object";

    const chainWithTypes = node[replaceKey];
    let chain = chainWithTypes;

    while (isTransparentExprWrapper(chain)) {
      chain = chain.expression;
    }

    let ref;
    let check;
    if (isCall && t.isIdentifier(chain, { name: "eval" })) {
      check = ref = chain;
      // `eval?.()` is an indirect eval call transformed to `(0,eval)()`
      node[replaceKey] = t.sequenceExpression([t.numericLiteral(0), ref]);
    } else if (pureGetters && isCall && isSimpleMemberExpression(chain)) {
      // If we assume getters are pure (avoiding a Function#call) and we are at the call,
      // we can avoid a needless memoize. We only do this if the callee is a simple member
      // expression, to avoid multiple calls to nested call expressions.
      check = ref = chainWithTypes;
    } else {
      ref = scope.maybeGenerateMemoised(chain);
      if (ref) {
        check = t.assignmentExpression(
          "=",
          t.cloneNode(ref),
          // Here `chainWithTypes` MUST NOT be cloned because it could be
          // updated when generating the memoised context of a call
          // expression
          chainWithTypes,
        );

        node[replaceKey] = ref;
      } else {
        check = ref = chainWithTypes;
      }
    }

    // Ensure call expressions have the proper `this`
    // `foo.bar()` has context `foo`.
    if (isCall && t.isMemberExpression(chain)) {
      if (pureGetters && isSimpleMemberExpression(chain)) {
        // To avoid a Function#call, we can instead re-grab the property from the context object.
        // `a.?b.?()` translates roughly to `_a.b != null && _a.b()`
        node.callee = chainWithTypes;
      } else {
        // Otherwise, we need to memoize the context object, and change the call into a Function#call.
        // `a.?b.?()` translates roughly to `(_b = _a.b) != null && _b.call(_a)`
        const { object } = chain;
        let context = scope.maybeGenerateMemoised(object);
        if (context) {
          chain.object = t.assignmentExpression("=", context, object);
        } else if (t.isSuper(object)) {
          context = t.thisExpression();
        } else {
          context = object;
        }

        node.arguments.unshift(t.cloneNode(context));
        node.callee = t.memberExpression(node.callee, t.identifier("call"));
      }
    }
    let replacement = replacementPath.node;
    // Ensure (a?.b)() has proper `this`
    // The `parentIsCall` is constant within loop, we should check i === 0
    // to ensure that it is only applied to the first optional chain element
    // i.e. `?.b` in `(a?.b.c)()`
    if (i === 0 && parentIsCall) {
      // `(a?.b)()` to `(a == null ? undefined : a.b.bind(a))()`
      const object = skipTransparentExprWrappers(
        replacementPath.get("object"),
      ).node;
      let baseRef;
      if (!pureGetters || !isSimpleMemberExpression(object)) {
        // memoize the context object when getters are not always pure
        // or the object is not a simple member expression
        // `(a?.b.c)()` to `(a == null ? undefined : (_a$b = a.b).c.bind(_a$b))()`
        baseRef = scope.maybeGenerateMemoised(object);
        if (baseRef) {
          replacement.object = t.assignmentExpression("=", baseRef, object);
        }
      }
      replacement = t.callExpression(
        t.memberExpression(replacement, t.identifier("bind")),
        [t.cloneNode(baseRef ?? object)],
      );
    }

    if (willReplacementCastToBoolean) {
      // `if (a?.b) {}` transformed to `if (a != null && a.b) {}`
      // we don't need to return `void 0` because the returned value will
      // eveutally cast to boolean.
      const nonNullishCheck = noDocumentAll
        ? ast`${t.cloneNode(check)} != null`
        : ast`
            ${t.cloneNode(check)} !== null && ${t.cloneNode(ref)} !== void 0`;
      replacementPath.replaceWith(
        t.logicalExpression("&&", nonNullishCheck, replacement),
      );
      replacementPath = skipTransparentExprWrappers(
        replacementPath.get("right"),
      );
    } else {
      const nullishCheck = noDocumentAll
        ? ast`${t.cloneNode(check)} == null`
        : ast`
            ${t.cloneNode(check)} === null || ${t.cloneNode(ref)} === void 0`;

      const returnValue = isDeleteOperation ? ast`true` : ast`void 0`;
      replacementPath.replaceWith(
        t.conditionalExpression(nullishCheck, returnValue, replacement),
      );
      replacementPath = skipTransparentExprWrappers(
        replacementPath.get("alternate"),
      );
    }
  }
}
