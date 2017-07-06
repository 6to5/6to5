import jsx from "babel-plugin-syntax-jsx";
import helper from "babel-helper-builder-react-jsx";

export default function({ types: t }) {
  const JSX_ANNOTATION_REGEX = /\*?\s*@jsx\s+([^\s]+)/;

  const visitor = helper({
    pre(state) {
      const tagName = state.tagName;
      const args = state.args;
      if (t.react.isCompatTag(tagName)) {
        args.push(t.stringLiteral(tagName));
      } else {
        args.push(state.tagExpr);
      }
    },

    post(state, pass) {
      state.callee = pass.get("jsxIdentifier")();
    },
  });

  visitor.Program = function(path, state) {
    const { file } = state;
    let id = state.opts.pragma || "React.createElement";

    for (const comment of (file.ast.comments: Array<Object>)) {
      const matches = JSX_ANNOTATION_REGEX.exec(comment.value);
      if (matches) {
        id = matches[1];
        if (id === "React.DOM") {
          throw file.buildCodeFrameError(
            comment,
            "The @jsx React.DOM pragma has been deprecated as of React 0.12",
          );
        } else {
          break;
        }
      }
    }

    state.set("jsxIdentifier", () =>
      id
        .split(".")
        .map(name => t.identifier(name))
        .reduce((object, property) => t.memberExpression(object, property)),
    );
  };

  return {
    inherits: jsx,
    visitor,
  };
}
