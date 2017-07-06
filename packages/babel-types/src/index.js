import toFastProperties from "to-fast-properties";
import loClone from "lodash/clone";
import uniq from "lodash/uniq";

const t = exports;

/**
 * Registers `is[Type]` and `assert[Type]` generated functions for a given `type`.
 * Pass `skipAliasCheck` to force it to directly compare `node.type` with `type`.
 */

function registerType(type: string) {
  let is = t[`is${type}`];
  if (!is) {
    is = t[`is${type}`] = function(node, opts) {
      return t.is(type, node, opts);
    };
  }

  t[`assert${type}`] = function(node, opts) {
    opts = opts || {};
    if (!is(node, opts)) {
      throw new Error(
        `Expected type ${JSON.stringify(type)} with option ${JSON.stringify(
          opts,
        )}`,
      );
    }
  };
}

//

export {
  STATEMENT_OR_BLOCK_KEYS,
  FLATTENABLE_KEYS,
  FOR_INIT_KEYS,
  COMMENT_KEYS,
  LOGICAL_OPERATORS,
  UPDATE_OPERATORS,
  BOOLEAN_NUMBER_BINARY_OPERATORS,
  EQUALITY_BINARY_OPERATORS,
  COMPARISON_BINARY_OPERATORS,
  BOOLEAN_BINARY_OPERATORS,
  NUMBER_BINARY_OPERATORS,
  BINARY_OPERATORS,
  BOOLEAN_UNARY_OPERATORS,
  NUMBER_UNARY_OPERATORS,
  STRING_UNARY_OPERATORS,
  UNARY_OPERATORS,
  INHERIT_KEYS,
  BLOCK_SCOPED_SYMBOL,
  NOT_LOCAL_BINDING,
} from "./constants";

import "./definitions/init";
import {
  VISITOR_KEYS,
  ALIAS_KEYS,
  NODE_FIELDS,
  BUILDER_KEYS,
  DEPRECATED_KEYS,
} from "./definitions";
export { VISITOR_KEYS, ALIAS_KEYS, NODE_FIELDS, BUILDER_KEYS, DEPRECATED_KEYS };

import * as _react from "./react";
export { _react as react };

/**
 * Registers `is[Type]` and `assert[Type]` for all types.
 */

for (const type in t.VISITOR_KEYS) {
  registerType(type);
}

// Compat helpers so code for Babel 6.x is more likely to work on Babel 7.x.
export function isRestProperty(...args) {
  return t.isRestElement(...args);
}
export function isSpreadProperty(...args) {
  return t.isSpreadElement(...args);
}

/**
 * Flip `ALIAS_KEYS` for faster access in the reverse direction.
 */

t.FLIPPED_ALIAS_KEYS = {};

Object.keys(t.ALIAS_KEYS).forEach(function(type) {
  t.ALIAS_KEYS[type].forEach(function(alias) {
    const types = (t.FLIPPED_ALIAS_KEYS[alias] =
      t.FLIPPED_ALIAS_KEYS[alias] || []);
    types.push(type);
  });
});

/**
 * Registers `is[Alias]` and `assert[Alias]` functions for all aliases.
 */

Object.keys(t.FLIPPED_ALIAS_KEYS).forEach(function(type) {
  t[type.toUpperCase() + "_TYPES"] = t.FLIPPED_ALIAS_KEYS[type];
  registerType(type);
});

export const TYPES = Object.keys(t.VISITOR_KEYS)
  .concat(Object.keys(t.FLIPPED_ALIAS_KEYS))
  .concat(Object.keys(t.DEPRECATED_KEYS));

/**
 * Returns whether `node` is of given `type`.
 *
 * For better performance, use this instead of `is[Type]` when `type` is unknown.
 * Optionally, pass `skipAliasCheck` to directly compare `node.type` with `type`.
 */

export function is(type: string, node: Object, opts?: Object): boolean {
  if (!node) return false;

  const matches = isType(node.type, type);
  if (!matches) return false;

  if (typeof opts === "undefined") {
    return true;
  } else {
    return t.shallowEqual(node, opts);
  }
}

/**
 * Test if a `nodeType` is a `targetType` or if `targetType` is an alias of `nodeType`.
 */

export function isType(nodeType: string, targetType: string): boolean {
  if (nodeType === targetType) return true;

  // This is a fast-path. If the test above failed, but an alias key is found, then the
  // targetType was a primary node type, so there's no need to check the aliases.
  if (t.ALIAS_KEYS[targetType]) return false;

  const aliases: ?Array<string> = t.FLIPPED_ALIAS_KEYS[targetType];
  if (aliases) {
    if (aliases[0] === nodeType) return true;

    for (const alias of aliases) {
      if (nodeType === alias) return true;
    }
  }

  return false;
}

/**
 * Description
 */

Object.keys(t.BUILDER_KEYS).forEach(function(type) {
  const keys = t.BUILDER_KEYS[type];

  function builder() {
    if (arguments.length > keys.length) {
      throw new Error(
        `t.${type}: Too many arguments passed. Received ${arguments.length} but can receive ` +
          `no more than ${keys.length}`,
      );
    }

    const node = {};
    node.type = type;

    let i = 0;

    for (const key of (keys: Array<string>)) {
      const field = t.NODE_FIELDS[type][key];

      let arg = arguments[i++];
      if (arg === undefined) arg = loClone(field.default);

      node[key] = arg;
    }

    for (const key in node) {
      validate(node, key, node[key]);
    }

    return node;
  }

  t[type] = builder;
  t[type[0].toLowerCase() + type.slice(1)] = builder;
});

/**
 * Description
 */

for (const type in t.DEPRECATED_KEYS) {
  const newType = t.DEPRECATED_KEYS[type];

  function proxy(fn) {
    return function() {
      console.trace(`The node type ${type} has been renamed to ${newType}`);
      return fn.apply(this, arguments);
    };
  }

  t[type] = t[type[0].toLowerCase() + type.slice(1)] = proxy(t[newType]);
  t[`is${type}`] = proxy(t[`is${newType}`]);
  t[`assert${type}`] = proxy(t[`assert${newType}`]);
}

/**
 * Description
 */

export function validate(node?: Object, key: string, val: any) {
  if (!node) return;

  const fields = t.NODE_FIELDS[node.type];
  if (!fields) return;

  const field = fields[key];
  if (!field || !field.validate) return;
  if (field.optional && val == null) return;

  field.validate(node, key, val);
}

/**
 * Test if an object is shallowly equal.
 */

export function shallowEqual(actual: Object, expected: Object): boolean {
  const keys = Object.keys(expected);

  for (const key of (keys: Array<string>)) {
    if (actual[key] !== expected[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Append a node to a member expression.
 */

export function appendToMemberExpression(
  member: Object,
  append: Object,
  computed?: boolean,
): Object {
  member.object = t.memberExpression(
    member.object,
    member.property,
    member.computed,
  );
  member.property = append;
  member.computed = !!computed;
  return member;
}

/**
 * Prepend a node to a member expression.
 */

export function prependToMemberExpression(
  member: Object,
  prepend: Object,
): Object {
  member.object = t.memberExpression(prepend, member.object);
  return member;
}

/**
 * Ensure the `key` (defaults to "body") of a `node` is a block.
 * Casting it to a block if it is not.
 */

export function ensureBlock(node: Object, key: string = "body"): Object {
  return (node[key] = t.toBlock(node[key], node));
}

/**
 * Create a shallow clone of a `node` excluding `_private` properties.
 */

export function clone(node: Object): Object {
  if (!node) return node;
  const newNode = {};
  for (const key in node) {
    if (key[0] === "_") continue;
    newNode[key] = node[key];
  }
  return newNode;
}

/**
 * Create a shallow clone of a `node` excluding `_private` and location properties.
 */

export function cloneWithoutLoc(node: Object): Object {
  const newNode = clone(node);
  delete newNode.loc;
  return newNode;
}

/**
 * Create a deep clone of a `node` and all of it's child nodes
 * exluding `_private` properties.
 */

export function cloneDeep(node: Object): Object {
  if (!node) return node;
  const newNode = {};

  for (const key in node) {
    if (key[0] === "_") continue;

    let val = node[key];

    if (val) {
      if (val.type) {
        val = t.cloneDeep(val);
      } else if (Array.isArray(val)) {
        val = val.map(t.cloneDeep);
      }
    }

    newNode[key] = val;
  }

  return newNode;
}

/**
 * Determines whether or not the input node `member` matches the
 * input `match`.
 *
 * For example, given the match `React.createClass` it would match the
 * parsed nodes of `React.createClass` and `React["createClass"]`.
 */

export function matchesPattern(
  member: Object,
  match: string | Array<string>,
  allowPartial?: boolean,
): boolean {
  // not a member expression
  if (!t.isMemberExpression(member)) return false;

  const parts = Array.isArray(match) ? match : match.split(".");
  const nodes = [];

  let node;
  for (node = member; t.isMemberExpression(node); node = node.object) {
    nodes.push(node.property);
  }
  nodes.push(node);

  if (nodes.length < parts.length) return false;
  if (!allowPartial && nodes.length > parts.length) return false;

  for (let i = 0, j = nodes.length - 1; i < parts.length; i++, j--) {
    const node = nodes[j];
    let value;
    if (t.isIdentifier(node)) {
      value = node.name;
    } else if (t.isStringLiteral(node)) {
      value = node.value;
    } else {
      return false;
    }

    if (parts[i] !== value) return false;
  }

  return true;
}

/**
 * Build a function that when called will return whether or not the
 * input `node` `MemberExpression` matches the input `match`.
 *
 * For example, given the match `React.createClass` it would match the
 * parsed nodes of `React.createClass` and `React["createClass"]`.
 */

export function buildMatchMemberExpression(
  match: string,
  allowPartial?: boolean,
): Object => boolean {
  const parts = match.split(".");
  return function(member) {
    return matchesPattern(member, parts, allowPartial);
  };
}

/**
 * Remove comment properties from a node.
 */

export function removeComments(node: Object): Object {
  for (const key of t.COMMENT_KEYS) {
    delete node[key];
  }
  return node;
}

/**
 * Inherit all unique comments from `parent` node to `child` node.
 */

export function inheritsComments(child: Object, parent: Object): Object {
  inheritTrailingComments(child, parent);
  inheritLeadingComments(child, parent);
  inheritInnerComments(child, parent);
  return child;
}

export function inheritTrailingComments(child: Object, parent: Object) {
  _inheritComments("trailingComments", child, parent);
}

export function inheritLeadingComments(child: Object, parent: Object) {
  _inheritComments("leadingComments", child, parent);
}

export function inheritInnerComments(child: Object, parent: Object) {
  _inheritComments("innerComments", child, parent);
}

function _inheritComments(key, child, parent) {
  if (child && parent) {
    child[key] = uniq([].concat(child[key], parent[key]).filter(Boolean));
  }
}

/**
 * Inherit all contextual properties from `parent` node to `child` node.
 */

export function inherits(child: Object, parent: Object): Object {
  if (!child || !parent) return child;

  // optionally inherit specific properties if not null
  for (const key of (t.INHERIT_KEYS.optional: Array<string>)) {
    if (child[key] == null) {
      child[key] = parent[key];
    }
  }

  // force inherit "private" properties
  for (const key in parent) {
    if (key[0] === "_") child[key] = parent[key];
  }

  // force inherit select properties
  for (const key of (t.INHERIT_KEYS.force: Array<string>)) {
    child[key] = parent[key];
  }

  t.inheritsComments(child, parent);

  return child;
}

/**
 * TODO
 */

export function assertNode(node?) {
  if (!isNode(node)) {
    // $FlowFixMe
    throw new TypeError("Not a valid node " + (node && node.type));
  }
}

/**
 * TODO
 */

export function isNode(node?): boolean {
  return !!(node && VISITOR_KEYS[node.type]);
}

// Optimize property access.
toFastProperties(t);
toFastProperties(t.VISITOR_KEYS);

/**
 * A prefix AST traversal implementation implementation.
 */

export function traverseFast(
  node: Node,
  enter: (node: Node) => void,
  opts?: Object,
) {
  if (!node) return;

  const keys = t.VISITOR_KEYS[node.type];
  if (!keys) return;

  opts = opts || {};
  enter(node, opts);

  for (const key of keys) {
    const subNode = node[key];

    if (Array.isArray(subNode)) {
      for (const node of subNode) {
        traverseFast(node, enter, opts);
      }
    } else {
      traverseFast(subNode, enter, opts);
    }
  }
}

const CLEAR_KEYS: Array = ["tokens", "start", "end", "loc", "raw", "rawValue"];

const CLEAR_KEYS_PLUS_COMMENTS: Array = t.COMMENT_KEYS
  .concat(["comments"])
  .concat(CLEAR_KEYS);

/**
 * Remove all of the _* properties from a node along with the additional metadata
 * properties like location data and raw token data.
 */

export function removeProperties(node: Node, opts?: Object): void {
  opts = opts || {};
  const map = opts.preserveComments ? CLEAR_KEYS : CLEAR_KEYS_PLUS_COMMENTS;
  for (const key of map) {
    if (node[key] != null) node[key] = undefined;
  }

  for (const key in node) {
    if (key[0] === "_" && node[key] != null) node[key] = undefined;
  }

  const syms: Array<Symbol> = Object.getOwnPropertySymbols(node);
  for (const sym of syms) {
    node[sym] = null;
  }
}

export function removePropertiesDeep(tree: Node, opts?: Object): Node {
  traverseFast(tree, removeProperties, opts);
  return tree;
}

//
export {
  getBindingIdentifiers,
  getOuterBindingIdentifiers,
} from "./retrievers";

export {
  isBinding,
  isReferenced,
  isValidIdentifier,
  isLet,
  isBlockScoped,
  isVar,
  isSpecifierDefault,
  isScope,
  isImmutable,
  isNodesEquivalent,
} from "./validators";

export {
  toComputedKey,
  toSequenceExpression,
  toKeyAlias,
  toIdentifier,
  toBindingIdentifierName,
  toStatement,
  toExpression,
  toBlock,
  valueToNode,
} from "./converters";

export {
  createUnionTypeAnnotation,
  removeTypeDuplicates,
  createTypeAnnotationBasedOnTypeof,
} from "./flow";
