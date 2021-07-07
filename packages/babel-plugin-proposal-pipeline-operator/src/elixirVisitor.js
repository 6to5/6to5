import { types as t } from "@babel/core";
import buildOptimizedSequenceExpression from "./buildOptimizedSequenceExpression";

const elixirVisitor = {
  BinaryExpression(path) {
    const { scope, node } = path;
    const { operator, left, right } = node;
    if (operator !== "|>") return;

    if (t.isAwaitExpression(right) || t.isYieldExpression(right)) {
      // transform:   x |> await Foo()
      //      into:   await (x |> Foo())
      node.right = right.argument;
      right.argument = node;
      path.replaceWith(right);
      // note that this will apply recursively to the right-hand-side,
      // so if it's something crazy:     x |> (yield await (yield await f()))
      // it will eventually turn into:   yield await (yield await (x |> f()))
      return;
    }

    const placeholder = scope.generateUidIdentifierBasedOnNode(left);
    const rightPath = path.get("right");
    let call = right;

    if (t.isCallExpression(right) || t.isNewExpression(right)) {
      // transform:   Foo(...args)
      //      into:   Foo(placeholder, ...args)
      // transform:   new Bar(...args)
      //      into:   new Bar(placeholder, ...args)
      rightPath.unshiftContainer("arguments", t.cloneNode(placeholder));
    } else if (t.isArrowFunctionExpression(right)) {
      // transform:   (x => body)
      //      into:   (x => body)(placeholder)
      call = t.callExpression(right, [t.cloneNode(placeholder)]);
    } else {
      throw rightPath.buildCodeFrameError(
        "Arrow function, new or call expression expected.",
      );
    }

    const sequence = buildOptimizedSequenceExpression({
      placeholder,
      call,
      path,
    });

    path.replaceWith(sequence);
  },
};

export default elixirVisitor;
