import rewritePattern from "regexpu-core";
import * as regex from "babel-helper-regex";

export default function() {
  return {
    visitor: {
      RegExpLiteral({ node }) {
        if (!regex.is(node, "u")) return;
        node.pattern = rewritePattern(node.pattern, node.flags);
        regex.pullFlag(node, "u");
      },
    },
  };
}
