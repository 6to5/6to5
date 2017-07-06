import { getBindingIdentifiers } from "./retrievers";
import esutils from "esutils";
import * as t from "./index";
import { BLOCK_SCOPED_SYMBOL } from "./constants";

/**
 * Check if the input `node` is a binding identifier.
 */

export function isBinding(node: Object, parent: Object): boolean {
  const keys = getBindingIdentifiers.keys[parent.type];
  if (keys) {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const val = parent[key];
      if (Array.isArray(val)) {
        if (val.indexOf(node) >= 0) return true;
      } else {
        if (val === node) return true;
      }
    }
  }

  return false;
}

/**
 * Check if the input `node` is a reference to a bound variable.
 */

export function isReferenced(node: Object, parent: Object): boolean {
  switch (parent.type) {
    // yes: object::NODE
    // yes: NODE::callee
    case "BindExpression":
      return parent.object === node || parent.callee === node;

    // yes: PARENT[NODE]
    // yes: NODE.child
    // no: parent.NODE
    case "MemberExpression":
    case "JSXMemberExpression":
      if (parent.property === node && parent.computed) {
        return true;
      } else if (parent.object === node) {
        return true;
      } else {
        return false;
      }

    // no: new.NODE
    // no: NODE.target
    case "MetaProperty":
      return false;

    // yes: { [NODE]: "" }
    // yes: { NODE }
    // no: { NODE: "" }
    case "ObjectProperty":
      if (parent.key === node) {
        return parent.computed;
      }

    // no: let NODE = init;
    // yes: let id = NODE;
    case "VariableDeclarator":
      return parent.id !== node;

    // no: function NODE() {}
    // no: function foo(NODE) {}
    case "ArrowFunctionExpression":
    case "FunctionDeclaration":
    case "FunctionExpression":
      for (const param of (parent.params: Array<any>)) {
        if (param === node) return false;
      }

      return parent.id !== node;

    // no: export { foo as NODE };
    // yes: export { NODE as foo };
    // no: export { NODE as foo } from "foo";
    case "ExportSpecifier":
      if (parent.source) {
        return false;
      } else {
        return parent.local === node;
      }

    // no: export NODE from "foo";
    // no: export * as NODE from "foo";
    case "ExportNamespaceSpecifier":
    case "ExportDefaultSpecifier":
      return false;

    // no: <div NODE="foo" />
    case "JSXAttribute":
      return parent.name !== node;

    // no: class { NODE = value; }
    // yes: class { [NODE] = value; }
    // yes: class { key = NODE; }
    case "ClassProperty":
      if (parent.key === node) {
        return parent.computed;
      } else {
        return parent.value === node;
      }

    // no: import NODE from "foo";
    // no: import * as NODE from "foo";
    // no: import { NODE as foo } from "foo";
    // no: import { foo as NODE } from "foo";
    // no: import NODE from "bar";
    case "ImportDefaultSpecifier":
    case "ImportNamespaceSpecifier":
    case "ImportSpecifier":
      return false;

    // no: class NODE {}
    case "ClassDeclaration":
    case "ClassExpression":
      return parent.id !== node;

    // yes: class { [NODE]() {} }
    case "ClassMethod":
    case "ObjectMethod":
      return parent.key === node && parent.computed;

    // no: NODE: for (;;) {}
    case "LabeledStatement":
      return false;

    // no: try {} catch (NODE) {}
    case "CatchClause":
      return parent.param !== node;

    // no: function foo(...NODE) {}
    case "RestElement":
      return false;

    // yes: left = NODE;
    // no: NODE = right;
    case "AssignmentExpression":
      return parent.right === node;

    // no: [NODE = foo] = [];
    // yes: [foo = NODE] = [];
    case "AssignmentPattern":
      return parent.right === node;

    // no: [NODE] = [];
    // no: ({ NODE }) = [];
    case "ObjectPattern":
    case "ArrayPattern":
      return false;
  }

  return true;
}

/**
 * Check if the input `name` is a valid identifier name
 * and isn't a reserved word.
 */

export function isValidIdentifier(name: string): boolean {
  if (
    typeof name !== "string" ||
    esutils.keyword.isReservedWordES6(name, true)
  ) {
    return false;
  } else if (name === "await") {
    // invalid in module, valid in script; better be safe (see #4952)
    return false;
  } else {
    return esutils.keyword.isIdentifierNameES6(name);
  }
}

/**
 * Check if the input `node` is a `let` variable declaration.
 */

export function isLet(node: Object): boolean {
  return (
    t.isVariableDeclaration(node) &&
    (node.kind !== "var" || node[BLOCK_SCOPED_SYMBOL])
  );
}

/**
 * Check if the input `node` is block scoped.
 */

export function isBlockScoped(node: Object): boolean {
  return (
    t.isFunctionDeclaration(node) || t.isClassDeclaration(node) || t.isLet(node)
  );
}

/**
 * Check if the input `node` is a variable declaration.
 */

export function isVar(node: Object): boolean {
  return (
    t.isVariableDeclaration(node, { kind: "var" }) && !node[BLOCK_SCOPED_SYMBOL]
  );
}

/**
 * Check if the input `specifier` is a `default` import or export.
 */

export function isSpecifierDefault(specifier: Object): boolean {
  return (
    t.isImportDefaultSpecifier(specifier) ||
    t.isIdentifier(specifier.imported || specifier.exported, {
      name: "default",
    })
  );
}

/**
 * Check if the input `node` is a scope.
 */

export function isScope(node: Object, parent: Object): boolean {
  if (t.isBlockStatement(node) && t.isFunction(parent, { body: node })) {
    return false;
  }

  return t.isScopable(node);
}

/**
 * Check if the input `node` is definitely immutable.
 */

export function isImmutable(node: Object): boolean {
  if (t.isType(node.type, "Immutable")) return true;

  if (t.isIdentifier(node)) {
    if (node.name === "undefined") {
      // immutable!
      return true;
    } else {
      // no idea...
      return false;
    }
  }

  return false;
}

/**
 * Check if two nodes are equivalent
 */

export function isNodesEquivalent(a, b) {
  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a == null ||
    b == null
  ) {
    return a === b;
  }

  if (a.type !== b.type) {
    return false;
  }

  const fields = Object.keys(t.NODE_FIELDS[a.type] || a.type);

  for (const field of fields) {
    if (typeof a[field] !== typeof b[field]) {
      return false;
    }

    if (Array.isArray(a[field])) {
      if (!Array.isArray(b[field])) {
        return false;
      }
      if (a[field].length !== b[field].length) {
        return false;
      }

      for (let i = 0; i < a[field].length; i++) {
        if (!isNodesEquivalent(a[field][i], b[field][i])) {
          return false;
        }
      }
      continue;
    }

    if (!isNodesEquivalent(a[field], b[field])) {
      return false;
    }
  }

  return true;
}
