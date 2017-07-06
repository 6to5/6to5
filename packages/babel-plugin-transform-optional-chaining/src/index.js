import syntaxOptionalChaining from "babel-plugin-syntax-optional-chaining";

export default function({ types: t }) {
  function optional(path, replacementPath, loose = false) {
    const { scope } = path;
    const optionals = [];
    const nil = scope.buildUndefinedNode();

    let objectPath = path;
    while (
      objectPath.isMemberExpression() ||
      objectPath.isCallExpression() ||
      objectPath.isNewExpression()
    ) {
      const { node } = objectPath;
      if (node.optional) {
        optionals.push(node);
      }

      if (objectPath.isMemberExpression()) {
        objectPath = objectPath.get("object");
      } else {
        objectPath = objectPath.get("callee");
      }
    }

    for (let i = optionals.length - 1; i >= 0; i--) {
      const node = optionals[i];
      node.optional = false;

      const isCall = t.isCallExpression(node);
      const replaceKey =
        isCall || t.isNewExpression(node) ? "callee" : "object";
      const chain = node[replaceKey];

      let ref;
      let check;
      if (loose && isCall) {
        // If we are using a loose transform (avoiding a Function#call) and we are at the call,
        // we can avoid a needless memoize.
        check = ref = chain;
      } else {
        ref = scope.maybeGenerateMemoised(chain);
        if (ref) {
          check = t.assignmentExpression("=", ref, chain);
          node[replaceKey] = ref;
        } else {
          check = ref = chain;
        }
      }

      // Ensure call expressions have the proper `this`
      // `foo.bar()` has context `foo`.
      if (isCall && t.isMemberExpression(chain)) {
        if (loose) {
          // To avoid a Function#call, we can instead re-grab the property from the context object.
          // `a.?b.?()` translates roughly to `_a.b != null && _a.b()`
          node.callee = chain;
        } else {
          // Otherwise, we need to memoize the context object, and change the call into a Function#call.
          // `a.?b.?()` translates roughly to `(_b = _a.b) != null && _b.call(_a)`
          const { object } = chain;
          let context = scope.maybeGenerateMemoised(object);
          if (context) {
            chain.object = t.assignmentExpression("=", context, object);
          } else {
            context = object;
          }

          node.arguments.unshift(context);
          node.callee = t.memberExpression(node.callee, t.identifier("call"));
        }
      }

      replacementPath.replaceWith(
        t.conditionalExpression(
          t.binaryExpression("==", check, t.nullLiteral()),
          nil,
          replacementPath.node,
        ),
      );

      replacementPath = replacementPath.get("alternate");
    }
  }

  function findReplacementPath(path) {
    return path.find(path => {
      const { parentPath } = path;

      if (path.key == "left" && parentPath.isAssignmentExpression()) {
        return false;
      }
      if (path.key == "object" && parentPath.isMemberExpression()) {
        return false;
      }
      if (
        path.key == "callee" &&
        (parentPath.isCallExpression() || parentPath.isNewExpression())
      ) {
        return false;
      }
      if (path.key == "argument" && parentPath.isUpdateExpression()) {
        return false;
      }
      if (
        path.key == "argument" &&
        parentPath.isUnaryExpression({ operator: "delete" })
      ) {
        return false;
      }

      return true;
    });
  }

  return {
    inherits: syntaxOptionalChaining,

    visitor: {
      "MemberExpression|NewExpression|CallExpression"(path) {
        if (!path.node.optional) {
          return;
        }

        optional(path, findReplacementPath(path), this.opts.loose);
      },
    },
  };
}
