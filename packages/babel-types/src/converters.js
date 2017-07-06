import isPlainObject from "lodash/isPlainObject";
import isRegExp from "lodash/isRegExp";
import type { Scope } from "babel-traverse";
import * as t from "./index";

export function toComputedKey(
  node: Object,
  key: Object = node.key || node.property,
): Object {
  if (!node.computed) {
    if (t.isIdentifier(key)) key = t.stringLiteral(key.name);
  }
  return key;
}

function gatherSequenceExpressions(
  nodes: Array<Object>,
  scope: Scope,
  declars: Array<Object>,
): ?Object {
  const exprs = [];
  let ensureLastUndefined = true;

  for (const node of nodes) {
    ensureLastUndefined = false;

    if (t.isExpression(node)) {
      exprs.push(node);
    } else if (t.isExpressionStatement(node)) {
      exprs.push(node.expression);
    } else if (t.isVariableDeclaration(node)) {
      if (node.kind !== "var") return; // bailed

      for (const declar of (node.declarations: Array)) {
        const bindings = t.getBindingIdentifiers(declar);
        for (const key in bindings) {
          declars.push({
            kind: node.kind,
            id: bindings[key],
          });
        }

        if (declar.init) {
          exprs.push(t.assignmentExpression("=", declar.id, declar.init));
        }
      }

      ensureLastUndefined = true;
    } else if (t.isIfStatement(node)) {
      const consequent = node.consequent
        ? gatherSequenceExpressions([node.consequent], scope, declars)
        : scope.buildUndefinedNode();
      const alternate = node.alternate
        ? gatherSequenceExpressions([node.alternate], scope, declars)
        : scope.buildUndefinedNode();
      if (!consequent || !alternate) return; // bailed

      exprs.push(t.conditionalExpression(node.test, consequent, alternate));
    } else if (t.isBlockStatement(node)) {
      const body = gatherSequenceExpressions(node.body, scope, declars);
      if (!body) return; // bailed

      exprs.push(body);
    } else if (t.isEmptyStatement(node)) {
      // empty statement so ensure the last item is undefined if we're last
      ensureLastUndefined = true;
    } else {
      // bailed, we can't turn this statement into an expression
      return;
    }
  }

  if (ensureLastUndefined) {
    exprs.push(scope.buildUndefinedNode());
  }

  if (exprs.length === 1) {
    return exprs[0];
  } else {
    return t.sequenceExpression(exprs);
  }
}

/**
 * Turn an array of statement `nodes` into a `SequenceExpression`.
 *
 * Variable declarations are turned into simple assignments and their
 * declarations hoisted to the top of the current scope.
 *
 * Expression statements are just resolved to their expression.
 */

export function toSequenceExpression(
  nodes: Array<Object>,
  scope: Scope,
): ?Object {
  if (!nodes || !nodes.length) return;

  const declars = [];
  const result = gatherSequenceExpressions(nodes, scope, declars);
  if (!result) return;

  for (const declar of declars) {
    scope.push(declar);
  }

  return result;
}

export function toKeyAlias(node: Object, key: Object = node.key): string {
  let alias;

  if (node.kind === "method") {
    return toKeyAlias.increment() + "";
  } else if (t.isIdentifier(key)) {
    alias = key.name;
  } else if (t.isStringLiteral(key)) {
    alias = JSON.stringify(key.value);
  } else {
    alias = JSON.stringify(t.removePropertiesDeep(t.cloneDeep(key)));
  }

  if (node.computed) {
    alias = `[${alias}]`;
  }

  if (node.static) {
    alias = `static:${alias}`;
  }

  return alias;
}

toKeyAlias.uid = 0;

toKeyAlias.increment = function() {
  if (toKeyAlias.uid >= Number.MAX_SAFE_INTEGER) {
    return (toKeyAlias.uid = 0);
  } else {
    return toKeyAlias.uid++;
  }
};

export function toIdentifier(name: string): string {
  name = name + "";

  // replace all non-valid identifiers with dashes
  name = name.replace(/[^a-zA-Z0-9$_]/g, "-");

  // remove all dashes and numbers from start of name
  name = name.replace(/^[-0-9]+/, "");

  // camel case
  name = name.replace(/[-\s]+(.)?/g, function(match, c) {
    return c ? c.toUpperCase() : "";
  });

  if (!t.isValidIdentifier(name)) {
    name = `_${name}`;
  }

  return name || "_";
}

export function toBindingIdentifierName(name: string): string {
  name = toIdentifier(name);
  if (name === "eval" || name === "arguments") name = "_" + name;
  return name;
}

/**
 * [Please add a description.]
 * @returns {Object|Boolean}
 */

export function toStatement(node: Object, ignore?: boolean) {
  if (t.isStatement(node)) {
    return node;
  }

  let mustHaveId = false;
  let newType;

  if (t.isClass(node)) {
    mustHaveId = true;
    newType = "ClassDeclaration";
  } else if (t.isFunction(node)) {
    mustHaveId = true;
    newType = "FunctionDeclaration";
  } else if (t.isAssignmentExpression(node)) {
    return t.expressionStatement(node);
  }

  if (mustHaveId && !node.id) {
    newType = false;
  }

  if (!newType) {
    if (ignore) {
      return false;
    } else {
      throw new Error(`cannot turn ${node.type} to a statement`);
    }
  }

  node.type = newType;

  return node;
}

export function toExpression(node: Object): Object {
  if (t.isExpressionStatement(node)) {
    node = node.expression;
  }

  // return unmodified node
  // important for things like ArrowFunctions where
  // type change from ArrowFunction to FunctionExpression
  // produces bugs like -> `()=>a` to `function () a`
  // without generating a BlockStatement for it
  // ref: https://github.com/babel/babili/issues/130
  if (t.isExpression(node)) {
    return node;
  }

  // convert all classes and functions
  // ClassDeclaration -> ClassExpression
  // FunctionDeclaration, ObjectMethod, ClassMethod -> FunctionExpression
  if (t.isClass(node)) {
    node.type = "ClassExpression";
  } else if (t.isFunction(node)) {
    node.type = "FunctionExpression";
  }

  // if it's still not an expression
  if (!t.isExpression(node)) {
    throw new Error(`cannot turn ${node.type} to an expression`);
  }

  return node;
}

export function toBlock(node: Object, parent: Object): Object {
  if (t.isBlockStatement(node)) {
    return node;
  }

  if (t.isEmptyStatement(node)) {
    node = [];
  }

  if (!Array.isArray(node)) {
    if (!t.isStatement(node)) {
      if (t.isFunction(parent)) {
        node = t.returnStatement(node);
      } else {
        node = t.expressionStatement(node);
      }
    }

    node = [node];
  }

  return t.blockStatement(node);
}

export function valueToNode(value: any): Object {
  // undefined
  if (value === undefined) {
    return t.identifier("undefined");
  }

  // boolean
  if (value === true || value === false) {
    return t.booleanLiteral(value);
  }

  // null
  if (value === null) {
    return t.nullLiteral();
  }

  // strings
  if (typeof value === "string") {
    return t.stringLiteral(value);
  }

  // numbers
  if (typeof value === "number") {
    return t.numericLiteral(value);
  }

  // regexes
  if (isRegExp(value)) {
    const pattern = value.source;
    const flags = value.toString().match(/\/([a-z]+|)$/)[1];
    return t.regExpLiteral(pattern, flags);
  }

  // array
  if (Array.isArray(value)) {
    return t.arrayExpression(value.map(t.valueToNode));
  }

  // object
  if (isPlainObject(value)) {
    const props = [];
    for (const key in value) {
      let nodeKey;
      if (t.isValidIdentifier(key)) {
        nodeKey = t.identifier(key);
      } else {
        nodeKey = t.stringLiteral(key);
      }
      props.push(t.objectProperty(nodeKey, t.valueToNode(value[key])));
    }
    return t.objectExpression(props);
  }

  throw new Error("don't know how to turn this value into a node");
}
