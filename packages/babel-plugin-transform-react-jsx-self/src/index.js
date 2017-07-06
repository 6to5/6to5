/**
 * This adds a __self={this} JSX attribute to all JSX elements, which React will use
 * to generate some runtime warnings.
 *
 *
 * == JSX Literals ==
 *
 * <sometag />
 *
 * becomes:
 *
 * <sometag __self={this} />
 */

const TRACE_ID = "__self";

export default function({ types: t }) {
  const visitor = {
    JSXOpeningElement({ node }) {
      const id = t.jSXIdentifier(TRACE_ID);
      const trace = t.thisExpression();

      node.attributes.push(t.jSXAttribute(id, t.jSXExpressionContainer(trace)));
    },
  };

  return {
    visitor,
  };
}
