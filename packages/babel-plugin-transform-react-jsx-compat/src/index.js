import helper from "babel-helper-builder-react-jsx";

export default function({ types: t }) {
  return {
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("jsx");
    },

    visitor: helper({
      pre(state) {
        state.callee = state.tagExpr;
      },

      post(state) {
        if (t.react.isCompatTag(state.tagName)) {
          state.call = t.callExpression(
            t.memberExpression(
              t.memberExpression(t.identifier("React"), t.identifier("DOM")),
              state.tagExpr,
              t.isLiteral(state.tagExpr),
            ),
            state.args,
          );
        }
      },
    }),
  };
}
