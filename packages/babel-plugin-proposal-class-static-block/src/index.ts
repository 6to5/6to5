import { declare } from "@babel/helper-plugin-utils";
import syntaxClassStaticBlock from "@babel/plugin-syntax-class-static-block";

import {
  enableFeature,
  FEATURES,
} from "@babel/helper-create-class-features-plugin";

import type * as t from "@babel/types";
import type { NodePath } from "@babel/traverse";
/**
 * Generate a uid that is not in `denyList`
 *
 * @param {*} scope
 * @param {Set<string>} denyList a deny list that the generated uid should avoid
 * @returns
 */
function generateUid(scope, denyList: Set<string>) {
  const name = "";
  let uid;
  let i = 1;
  do {
    uid = scope._generateUid(name, i);
    i++;
  } while (denyList.has(uid));
  return uid;
}

export default declare(({ types: t, template, assertVersion }) => {
  assertVersion("^7.12.0");

  return {
    name: "proposal-class-static-block",
    inherits: syntaxClassStaticBlock,

    pre() {
      // Enable this in @babel/helper-create-class-features-plugin, so that it
      // can be handled by the private fields and methods transform.
      enableFeature(this.file, FEATURES.staticBlocks, /* loose */ false);
    },

    visitor: {
      // Run on ClassBody and not on class so that if @babel/helper-create-class-features-plugin
      // is enabled it can generte optimized output without passing from the intermediate
      // private fields representation.
      ClassBody(classBody: NodePath<t.ClassBody>) {
        const { scope } = classBody;
        const privateNames = new Set<string>();
        const body = classBody.get("body");
        for (const path of body) {
          if (path.isPrivate()) {
            // @ts-expect-error todo(flow->ts) NodePath.get types
            privateNames.add(path.get("key.id").node.name);
          }
        }
        for (const path of body) {
          if (!path.isStaticBlock()) continue;
          const staticBlockPrivateId = generateUid(scope, privateNames);
          privateNames.add(staticBlockPrivateId);
          const staticBlockRef = t.privateName(
            t.identifier(staticBlockPrivateId),
          );
          path.replaceWith(
            t.classPrivateProperty(
              staticBlockRef,
              template.expression.ast`(() => { ${
                (path.node as t.StaticBlock).body
              } })()`,
              [],
              /* static */ true,
            ),
          );
        }
      },
    },
  };
});
