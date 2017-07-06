import * as whitespace from "./whitespace";
import * as parens from "./parentheses";
import * as t from "babel-types";

function expandAliases(obj) {
  const newObj = {};

  function add(type, func) {
    const fn = newObj[type];
    newObj[type] = fn
      ? function(node, parent, stack) {
          const result = fn(node, parent, stack);

          return result == null ? func(node, parent, stack) : result;
        }
      : func;
  }

  for (const type of Object.keys(obj)) {
    const aliases = t.FLIPPED_ALIAS_KEYS[type];
    if (aliases) {
      for (const alias of aliases) {
        add(alias, obj[type]);
      }
    } else {
      add(type, obj[type]);
    }
  }

  return newObj;
}

// Rather than using `t.is` on each object property, we pre-expand any type aliases
// into concrete types so that the 'find' call below can be as fast as possible.
const expandedParens = expandAliases(parens);
const expandedWhitespaceNodes = expandAliases(whitespace.nodes);
const expandedWhitespaceList = expandAliases(whitespace.list);

function find(obj, node, parent, printStack) {
  const fn = obj[node.type];
  return fn ? fn(node, parent, printStack) : null;
}

function isOrHasCallExpression(node) {
  if (t.isCallExpression(node)) {
    return true;
  }

  if (t.isMemberExpression(node)) {
    return (
      isOrHasCallExpression(node.object) ||
      (!node.computed && isOrHasCallExpression(node.property))
    );
  } else {
    return false;
  }
}

export function needsWhitespace(node, parent, type) {
  if (!node) return 0;

  if (t.isExpressionStatement(node)) {
    node = node.expression;
  }

  let linesInfo = find(expandedWhitespaceNodes, node, parent);

  if (!linesInfo) {
    const items = find(expandedWhitespaceList, node, parent);
    if (items) {
      for (let i = 0; i < items.length; i++) {
        linesInfo = needsWhitespace(items[i], node, type);
        if (linesInfo) break;
      }
    }
  }

  return (linesInfo && linesInfo[type]) || 0;
}

export function needsWhitespaceBefore(node, parent) {
  return needsWhitespace(node, parent, "before");
}

export function needsWhitespaceAfter(node, parent) {
  return needsWhitespace(node, parent, "after");
}

export function needsParens(node, parent, printStack) {
  if (!parent) return false;

  if (t.isNewExpression(parent) && parent.callee === node) {
    if (isOrHasCallExpression(node)) return true;
  }

  return find(expandedParens, node, parent, printStack);
}
