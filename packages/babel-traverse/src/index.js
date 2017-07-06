import TraversalContext from "./context";
import * as visitors from "./visitors";
import * as messages from "babel-messages";
import includes from "lodash/includes";
import * as t from "babel-types";
import * as cache from "./cache";

export { default as NodePath } from "./path";
export { default as Scope } from "./scope";
export { default as Hub } from "./hub";
export { visitors };

export default function traverse(
  parent: Object | Array<Object>,
  opts?: Object,
  scope?: Object,
  state: Object,
  parentPath: Object,
) {
  if (!parent) return;
  if (!opts) opts = {};

  if (!opts.noScope && !scope) {
    if (parent.type !== "Program" && parent.type !== "File") {
      throw new Error(messages.get("traverseNeedsParent", parent.type));
    }
  }

  visitors.explode(opts);

  traverse.node(parent, opts, scope, state, parentPath);
}

traverse.visitors = visitors;
traverse.verify = visitors.verify;
traverse.explode = visitors.explode;

traverse.NodePath = require("./path");
traverse.Scope = require("./scope");
traverse.Hub = require("./hub");

traverse.cheap = function(node, enter) {
  return t.traverseFast(node, enter);
};

traverse.node = function(
  node: Object,
  opts: Object,
  scope: Object,
  state: Object,
  parentPath: Object,
  skipKeys?,
) {
  const keys: Array = t.VISITOR_KEYS[node.type];
  if (!keys) return;

  const context = new TraversalContext(scope, opts, state, parentPath);
  for (const key of keys) {
    if (skipKeys && skipKeys[key]) continue;
    if (context.visit(node, key)) return;
  }
};

traverse.clearNode = function(node, opts) {
  t.removeProperties(node, opts);

  cache.path.delete(node);
};

traverse.removeProperties = function(tree, opts) {
  t.traverseFast(tree, traverse.clearNode, opts);
  return tree;
};

function hasBlacklistedType(path, state) {
  if (path.node.type === state.type) {
    state.has = true;
    path.stop();
  }
}

traverse.hasType = function(
  tree: Object,
  scope: Object,
  type: Object,
  blacklistTypes: Array<string>,
): boolean {
  // the node we're searching in is blacklisted
  if (includes(blacklistTypes, tree.type)) return false;

  // the type we're looking for is the same as the passed node
  if (tree.type === type) return true;

  const state = {
    has: false,
    type: type,
  };

  traverse(
    tree,
    {
      blacklist: blacklistTypes,
      enter: hasBlacklistedType,
    },
    scope,
    state,
  );

  return state.has;
};

traverse.cache = cache;
