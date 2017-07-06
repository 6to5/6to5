import remapAsyncToGenerator from "babel-helper-remap-async-to-generator";
import syntaxAsyncGenerators from "babel-plugin-syntax-async-generators";

export default function({ types: t }) {
  const yieldStarVisitor = {
    Function(path) {
      path.skip();
    },

    YieldExpression({ node }, state) {
      if (!node.delegate) return;
      const callee = state.addHelper("asyncGeneratorDelegate");
      node.argument = t.callExpression(callee, [
        t.callExpression(state.addHelper("asyncIterator"), [node.argument]),
        t.memberExpression(
          state.addHelper("asyncGenerator"),
          t.identifier("await"),
        ),
      ]);
    },
  };

  return {
    inherits: syntaxAsyncGenerators,
    visitor: {
      Function(path, state) {
        if (!path.node.async || !path.node.generator) return;

        path.traverse(yieldStarVisitor, state);

        remapAsyncToGenerator(path, state.file, {
          wrapAsync: t.memberExpression(
            state.addHelper("asyncGenerator"),
            t.identifier("wrap"),
          ),
          wrapAwait: t.memberExpression(
            state.addHelper("asyncGenerator"),
            t.identifier("await"),
          ),
        });
      },
    },
  };
}
