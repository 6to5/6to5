import { declare } from "@babel/helper-plugin-utils";
import annotateAsPure from "@babel/helper-annotate-as-pure";
import { types as t } from "@babel/core";

// Mapping of React top-level methods that are pure.
// This plugin adds a /*#__PURE__#/ annotation to calls to these methods,
// so that terser and other minifiers can safely remove them during dead
// code elimination.
// See https://reactjs.org/docs/react-api.html
const PURE_CALLS = new Map([
  [
    "react",
    [
      "cloneElement",
      "createContext",
      "createElement",
      "createFactory",
      "createRef",
      "forwardRef",
      "isValidElement",
      "memo",
      "lazy",
    ],
  ],
  ["react-dom", ["createPortal"]],
]);

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-react-pure-annotations",
    visitor: {
      CallExpression(path) {
        if (isReactCall(path)) {
          annotateAsPure(path);
        }
      },
    },
  };
});

function isReactCall(path) {
  // If the callee is not a member expression, then check if it matches
  // a named import, e.g. `import {forwardRef} from 'react'`.
  if (!t.isMemberExpression(path.node.callee)) {
    const callee = path.get("callee");
    for (const [module, methods] of PURE_CALLS) {
      for (const method of methods) {
        if (callee.referencesImport(module, method)) {
          return true;
        }
      }
    }

    return false;
  }

  // Otherwise, check if the member expression's object matches
  // a default import (`import React from 'react'`) or namespace
  // import (`import * as React from 'react'), and check if the
  // property matches one of the pure methods.
  for (const [module, methods] of PURE_CALLS) {
    const object = path.get("callee.object");
    if (
      object.referencesImport(module, "default") ||
      object.referencesImport(module, "*")
    ) {
      for (const method of methods) {
        if (t.isIdentifier(path.node.callee.property, { name: method })) {
          return true;
        }
      }

      return false;
    }
  }

  return false;
}
