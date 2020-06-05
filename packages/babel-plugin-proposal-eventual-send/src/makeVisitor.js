function makeVisitor(t, targetGlobal = "HandledPromise") {
  const isSendOnlyExpression = path => {
    const ourParent = path.parent;
    switch (ourParent.type) {
      case "ExpressionStatement": {
        const maybeProgram = path.parentPath.parent;
        if (maybeProgram.type === "Program") {
          // If our expression statement is not the completion value,
          // we're sendOnly.
          return maybeProgram.body[maybeProgram.body.length - 1] !== ourParent;
        }
        // A statement elsewhere in the program.
        return true;
      }
      case "UnaryExpression": {
        // Void operator explicitly throws away the value.
        return ourParent.operator === "void";
      }
      default:
        // Any other non-statement parent cannot be send-only.
        return false;
    }
  };

  const fullTarget = (path, id) => {
    switch (targetGlobal) {
      case "HandledPromise": {
        const sfx = isSendOnlyExpression(path) ? "SendOnly" : "";
        let targetMember;
        switch (id) {
          case "eventualGet":
            targetMember = `get${sfx}`;
            break;
          case "eventualSend":
            targetMember = `applyMethod${sfx}`;
            break;
          case "eventualApply":
            targetMember = `applyFunction${sfx}`;
            break;
        }
        return t.memberExpression(
          t.identifier(targetGlobal),
          t.identifier(targetMember),
        );
      }
      case "Promise": {
        const sfx = isSendOnlyExpression(path) ? "Only" : "";
        const targetMember = `${id}${sfx}`;
        return t.memberExpression(
          t.identifier(targetGlobal),
          t.identifier(targetMember),
        );
      }
      default:
      // TODO
    }
  };

  return {
    EventualMemberExpression(path) {
      const { node } = path;
      const { object, computed, property } = node;

      const target = fullTarget(path, "eventualGet");
      const targs = [];
      targs.push(object);
      if (computed) {
        // Just use the computed property.
        targs.push(property);
      } else {
        // Make a literal from the name.
        targs.push(t.stringLiteral(property.name));
      }

      path.replaceWith(t.callExpression(target, targs));
    },
    EventualCallExpression(path) {
      const { node } = path;
      const { callee, arguments: args } = node;

      const target = fullTarget(path, "eventualApply");
      const targs = [];
      targs.push(callee);
      targs.push(t.arrayExpression(args));

      path.replaceWith(t.callExpression(target, targs));
    },
    EventualMemberCallExpression(path) {
      const { node } = path;
      const { callee, property, computed, arguments: args } = node;

      const target = fullTarget(path, "eventualSend");
      const targs = [];
      targs.push(callee);
      if (computed) {
        // Just use the computed property.
        targs.push(property);
      } else {
        // Make a literal from the name.
        targs.push(t.stringLiteral(property.name));
      }
      targs.push(t.arrayExpression(args));

      path.replaceWith(t.callExpression(target, targs));
    },
  };
}

export default makeVisitor;
