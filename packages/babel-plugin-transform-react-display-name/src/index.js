import path from "path";

export default function({ types: t }) {
  function addDisplayName(id, call) {
    const props = call.arguments[0].properties;
    let safe = true;

    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      const key = t.toComputedKey(prop);
      if (t.isLiteral(key, { value: "displayName" })) {
        safe = false;
        break;
      }
    }

    if (safe) {
      props.unshift(
        t.objectProperty(t.identifier("displayName"), t.stringLiteral(id)),
      );
    }
  }

  const isCreateClassCallExpression = t.buildMatchMemberExpression(
    "React.createClass",
  );
  const isCreateClassAddon = callee => callee.name === "createReactClass";

  function isCreateClass(node) {
    if (!node || !t.isCallExpression(node)) return false;

    // not createReactClass nor React.createClass call member object
    if (
      !isCreateClassCallExpression(node.callee) &&
      !isCreateClassAddon(node.callee)
    ) {
      return false;
    }

    // no call arguments
    const args = node.arguments;
    if (args.length !== 1) return false;

    // first node arg is not an object
    const first = args[0];
    if (!t.isObjectExpression(first)) return false;

    return true;
  }

  return {
    visitor: {
      ExportDefaultDeclaration({ node }, state) {
        if (isCreateClass(node.declaration)) {
          let displayName = path.basename(
            state.file.opts.filename,
            path.extname(state.file.opts.filename),
          );

          // ./{module name}/index.js
          if (displayName === "index") {
            displayName = path.basename(path.dirname(state.file.opts.filename));
          }

          addDisplayName(displayName, node.declaration);
        }
      },

      CallExpression(path) {
        const { node } = path;
        if (!isCreateClass(node)) return;

        let id;

        // crawl up the ancestry looking for possible candidates for displayName inference
        path.find(function(path) {
          if (path.isAssignmentExpression()) {
            id = path.node.left;
          } else if (path.isObjectProperty()) {
            id = path.node.key;
          } else if (path.isVariableDeclarator()) {
            id = path.node.id;
          } else if (path.isStatement()) {
            // we've hit a statement, we should stop crawling up
            return true;
          }

          // we've got an id! no need to continue
          if (id) return true;
        });

        // ensure that we have an identifier we can inherit from
        if (!id) return;

        // foo.bar -> bar
        if (t.isMemberExpression(id)) {
          id = id.property;
        }

        // identifiers are the only thing we can reliably get a name from
        if (t.isIdentifier(id)) {
          addDisplayName(id.name, node);
        }
      },
    },
  };
}
