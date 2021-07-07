import { declare } from "@babel/helper-plugin-utils";
import remapAsyncToGenerator from "@babel/helper-remap-async-to-generator";
import { addNamed } from "@babel/helper-module-imports";
import { types as t } from "@babel/core";

export default declare((api, options) => {
  api.assertVersion(7);

  const { method, module } = options;
  const noNewArrows = api.assumption("noNewArrows");

  if (method && module) {
    return {
      name: "transform-async-to-generator",

      visitor: {
        Function(path, state) {
          if (!path.node.async || path.node.generator) return;

          let wrapAsync = state.methodWrapper;
          if (wrapAsync) {
            wrapAsync = t.cloneNode(wrapAsync);
          } else {
            wrapAsync = state.methodWrapper = addNamed(path, method, module);
          }

          remapAsyncToGenerator(path, { wrapAsync }, noNewArrows);
        },
      },
    };
  }

  return {
    name: "transform-async-to-generator",

    visitor: {
      Function(path, state) {
        if (!path.node.async || path.node.generator) return;

        remapAsyncToGenerator(
          path,
          { wrapAsync: state.addHelper("asyncToGenerator") },
          noNewArrows,
        );
      },
    },
  };
});
