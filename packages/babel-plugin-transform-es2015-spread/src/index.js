export default function({ types: t }) {
  function getSpreadLiteral(spread, scope, state) {
    if (
      state.opts.loose &&
      !t.isIdentifier(spread.argument, { name: "arguments" })
    ) {
      return spread.argument;
    } else {
      return scope.toArray(spread.argument, true);
    }
  }

  function hasSpread(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (t.isSpreadElement(nodes[i])) {
        return true;
      }
    }
    return false;
  }

  function push(_props, nodes) {
    if (!_props.length) return _props;
    nodes.push(t.arrayExpression(_props));
    return [];
  }

  function build(props: Array, scope, state) {
    const nodes = [];
    let _props = [];

    for (const prop of props) {
      if (t.isSpreadElement(prop)) {
        _props = push(_props, nodes);
        nodes.push(getSpreadLiteral(prop, scope, state));
      } else {
        _props.push(prop);
      }
    }

    push(_props, nodes);

    return nodes;
  }

  return {
    visitor: {
      ArrayExpression(path, state) {
        const { node, scope } = path;
        const elements = node.elements;
        if (!hasSpread(elements)) return;

        const nodes = build(elements, scope, state);
        let first = nodes.shift();

        if (!t.isArrayExpression(first)) {
          nodes.unshift(first);
          first = t.arrayExpression([]);
        }

        path.replaceWith(
          t.callExpression(
            t.memberExpression(first, t.identifier("concat")),
            nodes,
          ),
        );
      },

      CallExpression(path, state) {
        const { node, scope } = path;

        const args = node.arguments;
        if (!hasSpread(args)) return;

        const calleePath = path.get("callee");
        if (calleePath.isSuper()) return;

        let contextLiteral = t.identifier("undefined");

        node.arguments = [];

        let nodes;
        if (args.length === 1 && args[0].argument.name === "arguments") {
          nodes = [args[0].argument];
        } else {
          nodes = build(args, scope, state);
        }

        const first = nodes.shift();
        if (nodes.length) {
          node.arguments.push(
            t.callExpression(
              t.memberExpression(first, t.identifier("concat")),
              nodes,
            ),
          );
        } else {
          node.arguments.push(first);
        }

        const callee = node.callee;

        if (calleePath.isMemberExpression()) {
          const temp = scope.maybeGenerateMemoised(callee.object);
          if (temp) {
            callee.object = t.assignmentExpression("=", temp, callee.object);
            contextLiteral = temp;
          } else {
            contextLiteral = callee.object;
          }
          t.appendToMemberExpression(callee, t.identifier("apply"));
        } else {
          node.callee = t.memberExpression(node.callee, t.identifier("apply"));
        }

        if (t.isSuper(contextLiteral)) {
          contextLiteral = t.thisExpression();
        }

        node.arguments.unshift(contextLiteral);
      },

      NewExpression(path, state) {
        const { node, scope } = path;
        let args = node.arguments;
        if (!hasSpread(args)) return;

        const nodes = build(args, scope, state);

        const context = t.arrayExpression([t.nullLiteral()]);

        args = t.callExpression(
          t.memberExpression(context, t.identifier("concat")),
          nodes,
        );

        path.replaceWith(
          t.newExpression(
            t.callExpression(
              t.memberExpression(
                t.memberExpression(
                  t.memberExpression(
                    t.identifier("Function"),
                    t.identifier("prototype"),
                  ),
                  t.identifier("bind"),
                ),
                t.identifier("apply"),
              ),
              [node.callee, args],
            ),
            [],
          ),
        );
      },
    },
  };
}
