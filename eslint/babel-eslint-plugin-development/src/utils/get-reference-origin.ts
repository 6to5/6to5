/*::
type ReferenceOriginImport = { kind: "import", source: string, name: string };
type ReferenceOriginParam = {
  kind: "param",
  index: number,
  functionNode: Node,
};

type ReferenceOrigin =
  | ReferenceOriginImport
  | ReferenceOriginParam
  | { kind: "import *", source: string }
  | {
      kind: "property",
      base: ReferenceOriginImport | ReferenceOriginParam,
      path: string,
      name: string,
    };
*/

// Given a node and a context, returns a description of where its value comes
// from.
// It resolves imports, parameters of exported functions and property accesses.
// See the ReferenceOrigin type for more information.
export default function getReferenceOrigin(
  node,
  scope,
) /*: ?ReferenceOrigin */ {
  if (node.type === "Identifier") {
    const variable = getVariableDefinition(node.name, scope);
    if (!variable) return null;

    const definition = variable.definition;
    const defNode = definition.node;

    if (definition.type === "ImportBinding") {
      if (defNode.type === "ImportSpecifier") {
        return {
          kind: "import",
          source: definition.parent.source.value,
          name: defNode.imported.name,
        };
      }
      if (defNode.type === "ImportNamespaceSpecifier") {
        return {
          kind: "import *",
          source: definition.parent.source.value,
        };
      }
    }

    if (definition.type === "Variable" && defNode.init) {
      const origin = getReferenceOrigin(defNode.init, variable.scope);
      return origin && patternToProperty(definition.name, origin);
    }

    if (definition.type === "Parameter") {
      return patternToProperty(definition.name, {
        kind: "param",
        index: definition.index,
        functionNode: definition.node,
      });
    }
  }

  if (node.type === "MemberExpression" && !node.computed) {
    const origin = getReferenceOrigin(node.object, scope);
    return origin && addProperty(origin, node.property.name);
  }

  return null;
}

function getVariableDefinition(name, scope) {
  let currentScope = scope;
  do {
    const variable = currentScope.set.get(name);
    if (variable && variable.defs[0]) {
      return { scope: currentScope, definition: variable.defs[0] };
    }
  } while ((currentScope = currentScope.upper));
}

function patternToProperty(id, base) {
  const path = getPatternPath(id);
  return path && path.reduce(addProperty, base);
}

// Adds a property to a given origin. If it was a namespace import it becomes
// a named import, so that `import * as x from "foo"; x.bar` and
// `import { bar } from "foo"` have the same origin.
function addProperty(origin, name) {
  if (origin.kind === "import *") {
    return {
      kind: "import",
      source: origin.source,
      name,
    };
  }
  if (origin.kind === "property") {
    return {
      kind: "property",
      base: origin.base,
      path: origin.path + "." + name,
      name,
    };
  }
  return {
    kind: "property",
    base: origin,
    path: name,
    name,
  };
}

// if "node" is c of { a: { b: c } }, the result is ["a","b"]
function getPatternPath(node) {
  let current = node;
  const path = [];

  // Unshift keys to path while going up
  do {
    const property = current.parent;
    if (
      property.type === "ArrayPattern" ||
      property.type === "AssignmentPattern" ||
      property.computed
    ) {
      // These nodes are not supported.
      return null;
    }
    if (property.type === "Property") {
      path.unshift(property.key.name);
    } else {
      // The destructuring pattern is finished
      break;
    }
  } while ((current = current.parent.parent));

  return path;
}
