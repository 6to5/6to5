// This file contains methods responsible for dealing with/retrieving children or siblings.

import type TraversalContext from "../index";
import NodePath from "./index";
import * as t from "babel-types";

export function getOpposite(): ?NodePath {
  if (this.key === "left") {
    return this.getSibling("right");
  } else if (this.key === "right") {
    return this.getSibling("left");
  }
}

function addCompletionRecords(path, paths) {
  if (path) return paths.concat(path.getCompletionRecords());
  return paths;
}

export function getCompletionRecords(): Array {
  let paths = [];

  if (this.isIfStatement()) {
    paths = addCompletionRecords(this.get("consequent"), paths);
    paths = addCompletionRecords(this.get("alternate"), paths);
  } else if (this.isDoExpression() || this.isFor() || this.isWhile()) {
    paths = addCompletionRecords(this.get("body"), paths);
  } else if (this.isProgram() || this.isBlockStatement()) {
    paths = addCompletionRecords(this.get("body").pop(), paths);
  } else if (this.isFunction()) {
    return this.get("body").getCompletionRecords();
  } else if (this.isTryStatement()) {
    paths = addCompletionRecords(this.get("block"), paths);
    paths = addCompletionRecords(this.get("handler"), paths);
    paths = addCompletionRecords(this.get("finalizer"), paths);
  } else {
    paths.push(this);
  }

  return paths;
}

export function getSibling(key): NodePath {
  return NodePath.get({
    parentPath: this.parentPath,
    parent: this.parent,
    container: this.container,
    listKey: this.listKey,
    key: key,
  });
}

export function getPrevSibling(): NodePath {
  return this.getSibling(this.key - 1);
}

export function getNextSibling(): NodePath {
  return this.getSibling(this.key + 1);
}

export function getAllNextSiblings(): Array<NodePath> {
  let _key = this.key;
  let sibling: NodePath = this.getSibling(++_key);
  const siblings: Array<NodePath> = [];
  while (sibling.node) {
    siblings.push(sibling);
    sibling = this.getSibling(++_key);
  }
  return siblings;
}

export function getAllPrevSiblings(): Array<NodePath> {
  let _key = this.key;
  let sibling: NodePath = this.getSibling(--_key);
  const siblings: Array<NodePath> = [];
  while (sibling.node) {
    siblings.push(sibling);
    sibling = this.getSibling(--_key);
  }
  return siblings;
}

export function get(
  key: string,
  context?: boolean | TraversalContext,
): NodePath {
  if (context === true) context = this.context;
  const parts = key.split(".");
  if (parts.length === 1) {
    // "foo"
    return this._getKey(key, context);
  } else {
    // "foo.bar"
    return this._getPattern(parts, context);
  }
}

export function _getKey(key, context?) {
  const node = this.node;
  const container = node[key];

  if (Array.isArray(container)) {
    // requested a container so give them all the paths
    return container.map((_, i) => {
      return NodePath.get({
        listKey: key,
        parentPath: this,
        parent: node,
        container: container,
        key: i,
      }).setContext(context);
    });
  } else {
    return NodePath.get({
      parentPath: this,
      parent: node,
      container: node,
      key: key,
    }).setContext(context);
  }
}

export function _getPattern(parts, context) {
  let path = this;
  for (const part of (parts: Array)) {
    if (part === ".") {
      path = path.parentPath;
    } else {
      if (Array.isArray(path)) {
        path = path[part];
      } else {
        path = path.get(part, context);
      }
    }
  }
  return path;
}

export function getBindingIdentifiers(duplicates?): Object {
  return t.getBindingIdentifiers(this.node, duplicates);
}

export function getOuterBindingIdentifiers(duplicates?): Object {
  return t.getOuterBindingIdentifiers(this.node, duplicates);
}

// original source - https://github.com/babel/babel/blob/master/packages/babel-types/src/retrievers.js
// path.getBindingIdentifiers returns nodes where the following re-implementation
// returns paths
export function getBindingIdentifierPaths(
  duplicates = false,
  outerOnly = false,
) {
  const path = this;
  let search = [].concat(path);
  const ids = Object.create(null);

  while (search.length) {
    const id = search.shift();
    if (!id) continue;
    if (!id.node) continue;

    const keys = t.getBindingIdentifiers.keys[id.node.type];

    if (id.isIdentifier()) {
      if (duplicates) {
        const _ids = (ids[id.node.name] = ids[id.node.name] || []);
        _ids.push(id);
      } else {
        ids[id.node.name] = id;
      }
      continue;
    }

    if (id.isExportDeclaration()) {
      const declaration = id.get("declaration");
      if (declaration.isDeclaration()) {
        search.push(declaration);
      }
      continue;
    }

    if (outerOnly) {
      if (id.isFunctionDeclaration()) {
        search.push(id.get("id"));
        continue;
      }
      if (id.isFunctionExpression()) {
        continue;
      }
    }

    if (keys) {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const child = id.get(key);
        if (Array.isArray(child) || child.node) {
          search = search.concat(child);
        }
      }
    }
  }

  return ids;
}

export function getOuterBindingIdentifierPaths(duplicates?) {
  return this.getBindingIdentifierPaths(duplicates, true);
}
