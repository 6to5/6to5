import map from "lodash/map";
import * as t from "babel-types";

type WhitespaceObject = {
  before?: boolean,
  after?: boolean,
};

/**
 * Crawl a node to test if it contains a CallExpression, a Function, or a Helper.
 *
 * @example
 * crawl(node)
 * // { hasCall: false, hasFunction: true, hasHelper: false }
 */

function crawl(node, state = {}) {
  if (t.isMemberExpression(node)) {
    crawl(node.object, state);
    if (node.computed) crawl(node.property, state);
  } else if (t.isBinary(node) || t.isAssignmentExpression(node)) {
    crawl(node.left, state);
    crawl(node.right, state);
  } else if (t.isCallExpression(node)) {
    state.hasCall = true;
    crawl(node.callee, state);
  } else if (t.isFunction(node)) {
    state.hasFunction = true;
  } else if (t.isIdentifier(node)) {
    state.hasHelper = state.hasHelper || isHelper(node.callee);
  }

  return state;
}

/**
 * Test if a node is or has a helper.
 */

function isHelper(node) {
  if (t.isMemberExpression(node)) {
    return isHelper(node.object) || isHelper(node.property);
  } else if (t.isIdentifier(node)) {
    return node.name === "require" || node.name[0] === "_";
  } else if (t.isCallExpression(node)) {
    return isHelper(node.callee);
  } else if (t.isBinary(node) || t.isAssignmentExpression(node)) {
    return (
      (t.isIdentifier(node.left) && isHelper(node.left)) || isHelper(node.right)
    );
  } else {
    return false;
  }
}

function isType(node) {
  return (
    t.isLiteral(node) ||
    t.isObjectExpression(node) ||
    t.isArrayExpression(node) ||
    t.isIdentifier(node) ||
    t.isMemberExpression(node)
  );
}

/**
 * Tests for node types that need whitespace.
 */

export const nodes = {
  /**
   * Test if AssignmentExpression needs whitespace.
   */

  AssignmentExpression(node: Object): ?WhitespaceObject {
    const state = crawl(node.right);
    if ((state.hasCall && state.hasHelper) || state.hasFunction) {
      return {
        before: state.hasFunction,
        after: true,
      };
    }
  },

  /**
   * Test if SwitchCase needs whitespace.
   */

  SwitchCase(node: Object, parent: Object): WhitespaceObject {
    return {
      before: node.consequent.length || parent.cases[0] === node,
      after:
        !node.consequent.length &&
        parent.cases[parent.cases.length - 1] === node,
    };
  },

  /**
   * Test if LogicalExpression needs whitespace.
   */

  LogicalExpression(node: Object): ?WhitespaceObject {
    if (t.isFunction(node.left) || t.isFunction(node.right)) {
      return {
        after: true,
      };
    }
  },

  /**
   * Test if Literal needs whitespace.
   */

  Literal(node: Object): ?WhitespaceObject {
    if (node.value === "use strict") {
      return {
        after: true,
      };
    }
  },

  /**
   * Test if CallExpression needs whitespace.
   */

  CallExpression(node: Object): ?WhitespaceObject {
    if (t.isFunction(node.callee) || isHelper(node)) {
      return {
        before: true,
        after: true,
      };
    }
  },

  /**
   * Test if VariableDeclaration needs whitespace.
   */

  VariableDeclaration(node: Object): ?WhitespaceObject {
    for (let i = 0; i < node.declarations.length; i++) {
      const declar = node.declarations[i];

      let enabled = isHelper(declar.id) && !isType(declar.init);
      if (!enabled) {
        const state = crawl(declar.init);
        enabled = (isHelper(declar.init) && state.hasCall) || state.hasFunction;
      }

      if (enabled) {
        return {
          before: true,
          after: true,
        };
      }
    }
  },

  /**
   * Test if IfStatement needs whitespace.
   */

  IfStatement(node: Object): ?WhitespaceObject {
    if (t.isBlockStatement(node.consequent)) {
      return {
        before: true,
        after: true,
      };
    }
  },
};

/**
 * Test if Property needs whitespace.
 */

nodes.ObjectProperty = nodes.ObjectTypeProperty = nodes.ObjectMethod = function(
  node: Object,
  parent,
): ?WhitespaceObject {
  if (parent.properties[0] === node) {
    return {
      before: true,
    };
  }
};

nodes.ObjectTypeCallProperty = function(
  node: Object,
  parent,
): ?WhitespaceObject {
  if (
    parent.callProperties[0] === node &&
    (!parent.properties || !parent.properties.length)
  ) {
    return {
      before: true,
    };
  }
};

nodes.ObjectTypeIndexer = function(node: Object, parent): ?WhitespaceObject {
  if (
    parent.indexers[0] === node &&
    (!parent.properties || !parent.properties.length) &&
    (!parent.callProperties || !parent.callProperties.length)
  ) {
    return {
      before: true,
    };
  }
};

/**
 * Returns lists from node types that need whitespace.
 */

export const list = {
  /**
   * Return VariableDeclaration declarations init properties.
   */

  VariableDeclaration(node: Object): Array<Object> {
    return map(node.declarations, "init");
  },

  /**
   * Return VariableDeclaration elements.
   */

  ArrayExpression(node: Object): Array<Object> {
    return node.elements;
  },

  /**
   * Return VariableDeclaration properties.
   */

  ObjectExpression(node: Object): Array<Object> {
    return node.properties;
  },
};

/**
 * Add whitespace tests for nodes and their aliases.
 */

[
  ["Function", true],
  ["Class", true],
  ["Loop", true],
  ["LabeledStatement", true],
  ["SwitchStatement", true],
  ["TryStatement", true],
].forEach(function([type, amounts]) {
  if (typeof amounts === "boolean") {
    amounts = { after: amounts, before: amounts };
  }
  [type].concat(t.FLIPPED_ALIAS_KEYS[type] || []).forEach(function(type) {
    nodes[type] = function() {
      return amounts;
    };
  });
});
