import * as t from "babel-types";

export default function() {
  return {
    visitor: {
      Program(path, state) {
        if (state.opts.strict === false || state.opts.strictMode === false) {
          return;
        }

        const { node } = path;

        for (const directive of (node.directives: Array<Object>)) {
          if (directive.value.value === "use strict") return;
        }

        path.unshiftContainer(
          "directives",
          t.directive(t.directiveLiteral("use strict")),
        );
      },
    },
  };
}
