import { declare } from "@babel/helper-plugin-utils";
import { template, types as t } from "@babel/core";

export default declare((api, options) => {
  api.assertVersion(7);

  const ignoreToPrimitiveHint =
    api.assumption("ignoreToPrimitiveHint") ?? options.loose;
  const mutableTemplateObject =
    api.assumption("mutableTemplateObject") ?? options.loose;

  let helperName = "taggedTemplateLiteral";
  if (mutableTemplateObject) helperName += "Loose";

  /**
   * This function groups the objects into multiple calls to `.concat()` in
   * order to preserve execution order of the primitive conversion, e.g.
   *
   *   "".concat(obj.foo, "foo", obj2.foo, "foo2")
   *
   * would evaluate both member expressions _first_ then, `concat` will
   * convert each one to a primitive, whereas
   *
   *   "".concat(obj.foo, "foo").concat(obj2.foo, "foo2")
   *
   * would evaluate the member, then convert it to a primitive, then evaluate
   * the second member and convert that one, which reflects the spec behavior
   * of template literals.
   */
  function buildConcatCallExpressions(items) {
    let avail = true;
    return items.reduce(function (left, right) {
      let canBeInserted = t.isLiteral(right);

      if (!canBeInserted && avail) {
        canBeInserted = true;
        avail = false;
      }
      if (canBeInserted && t.isCallExpression(left)) {
        left.arguments.push(right);
        return left;
      }
      return t.callExpression(
        t.memberExpression(left, t.identifier("concat")),
        [right],
      );
    });
  }

  return {
    name: "transform-template-literals",

    visitor: {
      TaggedTemplateExpression(path) {
        const { node } = path;
        const { quasi } = node;

        const strings = [];
        const raws = [];

        // Flag variable to check if contents of strings and raw are equal
        let isStringsRawEqual = true;

        for (const elem of (quasi.quasis: Array)) {
          const { raw, cooked } = elem.value;
          const value =
            cooked == null
              ? path.scope.buildUndefinedNode()
              : t.stringLiteral(cooked);

          strings.push(value);
          raws.push(t.stringLiteral(raw));

          if (raw !== cooked) {
            // false even if one of raw and cooked are not equal
            isStringsRawEqual = false;
          }
        }

        const helperArgs = [t.arrayExpression(strings)];
        // only add raw arrayExpression if there is any difference between raws and strings
        if (!isStringsRawEqual) {
          helperArgs.push(t.arrayExpression(raws));
        }

        const tmp = path.scope.generateUidIdentifier("templateObject");
        path.scope.getProgramParent().push({ id: t.cloneNode(tmp) });

        path.replaceWith(
          t.callExpression(node.tag, [
            template.expression.ast`
              ${t.cloneNode(tmp)} || (
                ${tmp} = ${this.addHelper(helperName)}(${helperArgs})
              )
            `,
            ...quasi.expressions,
          ]),
        );
      },

      TemplateLiteral(path) {
        const nodes = [];
        const expressions = path.get("expressions");

        let index = 0;
        for (const elem of (path.node.quasis: Array)) {
          if (elem.value.cooked) {
            nodes.push(t.stringLiteral(elem.value.cooked));
          }

          if (index < expressions.length) {
            const expr = expressions[index++];
            const node = expr.node;
            if (!t.isStringLiteral(node, { value: "" })) {
              nodes.push(node);
            }
          }
        }

        // since `+` is left-to-right associative
        // ensure the first node is a string if first/second isn't
        if (
          !t.isStringLiteral(nodes[0]) &&
          !(ignoreToPrimitiveHint && t.isStringLiteral(nodes[1]))
        ) {
          nodes.unshift(t.stringLiteral(""));
        }
        let root = nodes[0];

        if (ignoreToPrimitiveHint) {
          for (let i = 1; i < nodes.length; i++) {
            root = t.binaryExpression("+", root, nodes[i]);
          }
        } else if (nodes.length > 1) {
          root = buildConcatCallExpressions(nodes);
        }

        path.replaceWith(root);
      },
    },
  };
});
