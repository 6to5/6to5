import remapAsyncToGenerator from "babel-helper-remap-async-to-generator";
import syntaxAsyncFunctions from "babel-plugin-syntax-async-functions";

export default function() {
  return {
    inherits: syntaxAsyncFunctions,

    visitor: {
      Function(path, state) {
        if (!path.node.async || path.node.generator) return;

        // Ensure any Promise bindings at the Program level are renamed
        // so the asyncToGenerator helper only sees the native Promise
        const programScope = path.scope.getProgramParent();
        if (programScope.hasBinding("Promise", true)) {
          programScope.rename("Promise");
        }

        remapAsyncToGenerator(path, state.file, {
          wrapAsync: state.addHelper("asyncToGenerator"),
        });
      },
    },
  };
}
