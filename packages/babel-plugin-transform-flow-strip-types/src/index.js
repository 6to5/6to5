import syntaxFlow from "babel-plugin-syntax-flow";

export default function({ types: t }) {
  const FLOW_DIRECTIVE = "@flow";

  return {
    inherits: syntaxFlow,

    visitor: {
      Program(path, { file: { ast: { comments } } }) {
        for (const comment of (comments: Array<Object>)) {
          if (comment.value.indexOf(FLOW_DIRECTIVE) >= 0) {
            // remove flow directive
            comment.value = comment.value.replace(FLOW_DIRECTIVE, "");

            // remove the comment completely if it only consists of whitespace and/or stars
            if (!comment.value.replace(/\*/g, "").trim()) comment.ignore = true;
          }
        }
      },

      ImportDeclaration(path) {
        if (!path.node.specifiers.length) return;

        let typeCount = 0;

        path.node.specifiers.forEach(({ importKind }) => {
          if (importKind === "type" || importKind === "typeof") {
            typeCount++;
          }
        });

        if (typeCount === path.node.specifiers.length) {
          path.remove();
        }
      },

      Flow(path) {
        path.remove();
      },

      ClassProperty(path) {
        path.node.variance = null;
        path.node.typeAnnotation = null;
        if (!path.node.value) path.remove();
      },

      Class(path) {
        path.node.implements = null;

        // We do this here instead of in a `ClassProperty` visitor because the class transform
        // would transform the class before we reached the class property.
        path.get("body.body").forEach(child => {
          if (child.isClassProperty()) {
            child.node.typeAnnotation = null;
            if (!child.node.value) child.remove();
          }
        });
      },

      AssignmentPattern({ node }) {
        node.left.optional = false;
      },

      Function({ node }) {
        for (let i = 0; i < node.params.length; i++) {
          const param = node.params[i];
          param.optional = false;
        }
      },

      TypeCastExpression(path) {
        let { node } = path;
        do {
          node = node.expression;
        } while (t.isTypeCastExpression(node));
        path.replaceWith(node);
      },
    },
  };
}
