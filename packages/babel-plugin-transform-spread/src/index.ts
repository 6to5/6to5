import { declare } from "@babel/helper-plugin-utils";
import { skipTransparentExprWrappers } from "@babel/helper-skip-transparent-expression-wrappers";
import { types as t } from "@babel/core";

export default declare((api, options) => {
  api.assertVersion(7);

  const iterableIsArray = api.assumption("iterableIsArray") ?? options.loose;
  const arrayLikeIsIterable =
    options.allowArrayLike ?? api.assumption("arrayLikeIsIterable");

  function getSpreadLiteral(spread, scope) {
    if (
      iterableIsArray &&
      !t.isIdentifier(spread.argument, { name: "arguments" })
    ) {
      return spread.argument;
    } else {
      return scope.toArray(spread.argument, true, arrayLikeIsIterable);
    }
  }

  function hasHole(spread) {
    return spread.elements.some(el => el === null);
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

  function build(props: Array, scope, file) {
    const nodes = [];
    let _props = [];

    for (const prop of props) {
      if (t.isSpreadElement(prop)) {
        _props = push(_props, nodes);
        let spreadLiteral = getSpreadLiteral(prop, scope);

        if (t.isArrayExpression(spreadLiteral) && hasHole(spreadLiteral)) {
          spreadLiteral = t.callExpression(
            file.addHelper(
              process.env.BABEL_8_BREAKING
                ? "arrayLikeToArray"
                : "arrayWithoutHoles",
            ),
            [spreadLiteral],
          );
        }

        nodes.push(spreadLiteral);
      } else {
        _props.push(prop);
      }
    }

    push(_props, nodes);

    return nodes;
  }

  return {
    name: "transform-spread",

    visitor: {
      ArrayExpression(path) {
        const { node, scope } = path;
        const elements = node.elements;
        if (!hasSpread(elements)) return;

        const nodes = build(elements, scope, this);
        let first = nodes[0];

        // If there is only one element in the ArrayExpression and
        // the element was transformed (Array.prototype.slice.call or toConsumableArray)
        // we know that the transformed code already takes care of cloning the array.
        // So we can simply return that element.
        if (nodes.length === 1 && first !== elements[0].argument) {
          path.replaceWith(first);
          return;
        }

        // If the first element is a ArrayExpression we can directly call
        // concat on it.
        // `[..].concat(..)`
        // If not then we have to use `[].concat(arr)` and not `arr.concat`
        // because `arr` could be extended/modified (e.g. Immutable) and we do not know exactly
        // what concat would produce.
        if (!t.isArrayExpression(first)) {
          first = t.arrayExpression([]);
        } else {
          nodes.shift();
        }

        path.replaceWith(
          t.callExpression(
            t.memberExpression(first, t.identifier("concat")),
            nodes,
          ),
        );
      },

      CallExpression(path) {
        const { node, scope } = path;

        const args = node.arguments;
        if (!hasSpread(args)) return;

        const calleePath = skipTransparentExprWrappers(path.get("callee"));

        if (calleePath.isSuper()) {
          // NOTE: spread and classes have almost the same compat data, so this is very unlikely to happen in practice.
          throw path.buildCodeFrameError(
            "It's not possible to compile spread arguments in `super()` without compiling classes.\n" +
              "Please add '@babel/plugin-transform-classes' to your Babel configuration.",
          );
        }

        let contextLiteral = scope.buildUndefinedNode();

        node.arguments = [];

        let nodes;
        if (args.length === 1 && args[0].argument.name === "arguments") {
          nodes = [args[0].argument];
        } else {
          nodes = build(args, scope, this);
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

        const callee = calleePath.node;

        if (calleePath.isMemberExpression()) {
          const temp = scope.maybeGenerateMemoised(callee.object);
          if (temp) {
            callee.object = t.assignmentExpression("=", temp, callee.object);
            contextLiteral = temp;
          } else {
            contextLiteral = t.cloneNode(callee.object);
          }
        }

        // We use the original callee here, to preserve any types/parentheses
        node.callee = t.memberExpression(node.callee, t.identifier("apply"));

        if (t.isSuper(contextLiteral)) {
          contextLiteral = t.thisExpression();
        }

        node.arguments.unshift(t.cloneNode(contextLiteral));
      },

      NewExpression(path) {
        const { node, scope } = path;
        let args = node.arguments;
        if (!hasSpread(args)) return;

        const nodes = build(args, scope, this);

        const first = nodes.shift();

        if (nodes.length) {
          args = t.callExpression(
            t.memberExpression(first, t.identifier("concat")),
            nodes,
          );
        } else {
          args = first;
        }

        path.replaceWith(
          t.callExpression(path.hub.addHelper("construct"), [
            node.callee,
            args,
          ]),
        );
      },
    },
  };
});
