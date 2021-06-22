import { declare } from "@babel/helper-plugin-utils";
import remapAsyncToGenerator from "@babel/helper-remap-async-to-generator";
import syntaxAsyncGenerators from "@babel/plugin-syntax-async-generators";
import { types as t } from "@babel/core";
import rewriteForAwait from "./for-await";

export default declare(api => {
  api.assertVersion(7);

  const yieldStarVisitor = {
    Function(path) {
      path.skip();
    },

    YieldExpression({ node }, state) {
      if (!node.delegate) return;
      const callee = state.addHelper("asyncGeneratorDelegate");
      node.argument = t.callExpression(callee, [
        t.callExpression(state.addHelper("asyncIterator"), [node.argument]),
        state.addHelper("awaitAsyncGenerator"),
      ]);
    },
  };

  const forAwaitVisitor = {
    Function(path) {
      path.skip();
    },

    ForOfStatement(path, { file }) {
      const { node } = path;
      if (!node.await) return;

      const build = rewriteForAwait(path, {
        getAsyncIterator: file.addHelper("asyncIterator"),
      });

      const { declar, loop } = build;
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
      } else {
        path.replaceWithMultiple(build.node);
      }
    },
  };

  const visitor = {
    Function(path, state) {
      if (!path.node.async) return;

      path.traverse(forAwaitVisitor, state);

      if (!path.node.generator) return;

      path.traverse(yieldStarVisitor, state);

      // We don't need to pass the noNewArrows assumption, since
      // async generators are never arrow functions.
      remapAsyncToGenerator(path, {
        wrapAsync: state.addHelper("wrapAsyncGenerator"),
        wrapAwait: state.addHelper("awaitAsyncGenerator"),
      });
    },
  };

  return {
    name: "proposal-async-generator-functions",
    inherits: syntaxAsyncGenerators.default,

    visitor: {
      Program(path, state) {
        // We need to traverse the ast here (instead of just vising Function
        // in the top level visitor) because for-await needs to run before the
        // async-to-generator plugin. This is because for-await is transpiled
        // using "await" expressions, which are then converted to "yield".
        //
        // This is bad for performance, but plugin ordering will allow as to
        // directly visit Function in the top level visitor.
        path.traverse(visitor, state);
      },
    },
  };
});
