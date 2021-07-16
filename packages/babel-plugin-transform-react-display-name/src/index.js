import { declare } from "@babel/helper-plugin-utils";
import path from "path";
import { types as t } from "@babel/core";

function addDisplayNameInCreateClass(id, call) {
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

function getDisplayNameReferenceIdentifier(
  path: NodePath<t.CallExpression>,
): ?t.Identifier {
  let id;

  // crawl up the ancestry looking for possible candidates for displayName inference
  path.find(function (path) {
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
  if (!t.isIdentifier(id)) return;

  return id;
}

function isCreateContext(node) {
  let callee;
  return (
    t.isCallExpression(node) &&
    t.isMemberExpression((callee = node.callee)) &&
    t.isIdentifier(callee.object, { name: "React" }) &&
    ((!callee.computed &&
      t.isIdentifier(callee.property, { name: "createContext" })) ||
      t.isStringLiteral(callee.property, { value: "createContext" }))
  );
}

function buildDisplayNameAssignment(ref, displayName) {
  return t.assignmentExpression(
    "=",
    t.memberExpression(t.cloneNode(ref), t.identifier("displayName")),
    t.stringLiteral(displayName),
  );
}

function addDisplayNameAfterCreateContext(
  id,
  path: t.NodePath<t.CallExpression>,
) {
  const { parentPath } = path;
  if (parentPath.isVariableDeclarator()) {
    // FooContext = React.createContext()
    const ref = parentPath.node.id;
    // parentPath.parentPath must be a VariableDeclaration because getDisplayNameReferenceIdentifier
    // does not support patterns
    parentPath.parentPath.insertAfter(buildDisplayNameAssignment(ref, id));
  } else if (parentPath.isAssignmentExpression()) {
    // var FooContext = React.createContext()
    const ref = parentPath.node.left;
    parentPath.insertAfter(buildDisplayNameAssignment(ref, id));
  } else {
    // (ref = React.createContext(), ref.displayName = "id", ref)
    const { scope } = path;
    const ref = scope.generateUidIdentifier("ref");
    scope.push({ id: ref });
    path.replaceWith(
      t.sequenceExpression([
        t.assignmentExpression("=", t.cloneNode(ref), path.node),
        buildDisplayNameAssignment(ref, id),
        t.cloneNode(ref),
      ]),
    );
  }
}

const createContextVisited = new WeakSet();

export default declare(api => {
  api.assertVersion(7);

  const isCreateClassCallExpression =
    t.buildMatchMemberExpression("React.createClass");
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
    name: "transform-react-display-name",

    visitor: {
      ExportDefaultDeclaration({ node }, state) {
        if (isCreateClass(node.declaration)) {
          const filename = state.filename || "unknown";

          let displayName = path.basename(filename, path.extname(filename));

          // ./{module name}/index.js
          if (displayName === "index") {
            displayName = path.basename(path.dirname(filename));
          }

          addDisplayNameInCreateClass(displayName, node.declaration);
        }
      },

      CallExpression(path) {
        const { node } = path;
        if (isCreateClass(node)) {
          const id = getDisplayNameReferenceIdentifier(path);
          if (id) {
            addDisplayNameInCreateClass(id.name, node);
          }
        } else if (isCreateContext(node)) {
          if (createContextVisited.has(node)) {
            return;
          }
          createContextVisited.add(node);
          const id = getDisplayNameReferenceIdentifier(path);

          if (id) {
            addDisplayNameAfterCreateContext(id.name, path);
          }
        }
      },
    },
  };
});
