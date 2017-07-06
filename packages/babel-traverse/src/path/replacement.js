// This file contains methods responsible for replacing a node with another.

import { codeFrameColumns } from "babel-code-frame";
import traverse from "../index";
import NodePath from "./index";
import { parse } from "babylon";
import * as t from "babel-types";

const hoistVariablesVisitor = {
  Function(path) {
    path.skip();
  },

  VariableDeclaration(path) {
    if (path.node.kind !== "var") return;

    const bindings = path.getBindingIdentifiers();
    for (const key in bindings) {
      path.scope.push({ id: bindings[key] });
    }

    const exprs = [];

    for (const declar of (path.node.declarations: Array<Object>)) {
      if (declar.init) {
        exprs.push(
          t.expressionStatement(
            t.assignmentExpression("=", declar.id, declar.init),
          ),
        );
      }
    }

    path.replaceWithMultiple(exprs);
  },
};

/**
 * Replace a node with an array of multiple. This method performs the following steps:
 *
 *  - Inherit the comments of first provided node with that of the current node.
 *  - Insert the provided nodes after the current node.
 *  - Remove the current node.
 */

export function replaceWithMultiple(nodes: Array<Object>) {
  this.resync();

  nodes = this._verifyNodeList(nodes);
  t.inheritLeadingComments(nodes[0], this.node);
  t.inheritTrailingComments(nodes[nodes.length - 1], this.node);
  this.node = this.container[this.key] = null;
  this.insertAfter(nodes);

  if (this.node) {
    this.requeue();
  } else {
    this.remove();
  }
}

/**
 * Parse a string as an expression and replace the current node with the result.
 *
 * NOTE: This is typically not a good idea to use. Building source strings when
 * transforming ASTs is an antipattern and SHOULD NOT be encouraged. Even if it's
 * easier to use, your transforms will be extremely brittle.
 */

export function replaceWithSourceString(replacement) {
  this.resync();

  try {
    replacement = `(${replacement})`;
    replacement = parse(replacement);
  } catch (err) {
    const loc = err.loc;
    if (loc) {
      const location = {
        start: {
          line: loc.line,
          column: loc.column + 1,
        },
      };
      err.message += " - make sure this is an expression.";
      err.message += "\n" + codeFrameColumns(replacement, location);
    }
    throw err;
  }

  replacement = replacement.program.body[0].expression;
  traverse.removeProperties(replacement);
  return this.replaceWith(replacement);
}

/**
 * Replace the current node with another.
 */

export function replaceWith(replacement) {
  this.resync();

  if (this.removed) {
    throw new Error("You can't replace this node, we've already removed it");
  }

  if (replacement instanceof NodePath) {
    replacement = replacement.node;
  }

  if (!replacement) {
    throw new Error(
      "You passed `path.replaceWith()` a falsy node, use `path.remove()` instead",
    );
  }

  if (this.node === replacement) {
    return;
  }

  if (this.isProgram() && !t.isProgram(replacement)) {
    throw new Error(
      "You can only replace a Program root node with another Program node",
    );
  }

  if (Array.isArray(replacement)) {
    throw new Error(
      "Don't use `path.replaceWith()` with an array of nodes, use `path.replaceWithMultiple()`",
    );
  }

  if (typeof replacement === "string") {
    throw new Error(
      "Don't use `path.replaceWith()` with a source string, use `path.replaceWithSourceString()`",
    );
  }

  if (this.isNodeType("Statement") && t.isExpression(replacement)) {
    if (
      !this.canHaveVariableDeclarationOrExpression() &&
      !this.canSwapBetweenExpressionAndStatement(replacement) &&
      !this.parentPath.isExportDefaultDeclaration()
    ) {
      // replacing a statement with an expression so wrap it in an expression statement
      replacement = t.expressionStatement(replacement);
    }
  }

  if (this.isNodeType("Expression") && t.isStatement(replacement)) {
    if (
      !this.canHaveVariableDeclarationOrExpression() &&
      !this.canSwapBetweenExpressionAndStatement(replacement)
    ) {
      // replacing an expression with a statement so let's explode it
      return this.replaceExpressionWithStatements([replacement]);
    }
  }

  const oldNode = this.node;
  if (oldNode) {
    t.inheritsComments(replacement, oldNode);
    t.removeComments(oldNode);
  }

  // replace the node
  this._replaceWith(replacement);
  this.type = replacement.type;

  // potentially create new scope
  this.setScope();

  // requeue for visiting
  this.requeue();
}

/**
 * Description
 */

export function _replaceWith(node) {
  if (!this.container) {
    throw new ReferenceError("Container is falsy");
  }

  if (this.inList) {
    t.validate(this.parent, this.key, [node]);
  } else {
    t.validate(this.parent, this.key, node);
  }

  this.debug(() => `Replace with ${node && node.type}`);

  this.node = this.container[this.key] = node;
}

/**
 * This method takes an array of statements nodes and then explodes it
 * into expressions. This method retains completion records which is
 * extremely important to retain original semantics.
 */

export function replaceExpressionWithStatements(nodes: Array<Object>) {
  this.resync();

  const toSequenceExpression = t.toSequenceExpression(nodes, this.scope);

  if (t.isSequenceExpression(toSequenceExpression)) {
    const exprs = toSequenceExpression.expressions;

    if (exprs.length >= 2 && this.parentPath.isExpressionStatement()) {
      this._maybePopFromStatements(exprs);
    }

    // could be just one element due to the previous maybe popping
    if (exprs.length === 1) {
      this.replaceWith(exprs[0]);
    } else {
      this.replaceWith(toSequenceExpression);
    }
  } else if (toSequenceExpression) {
    this.replaceWith(toSequenceExpression);
  } else {
    const container = t.arrowFunctionExpression([], t.blockStatement(nodes));

    this.replaceWith(t.callExpression(container, []));
    this.traverse(hoistVariablesVisitor);

    // add implicit returns to all ending expression statements
    const completionRecords: Array<NodePath> = this.get(
      "callee",
    ).getCompletionRecords();
    for (const path of completionRecords) {
      if (!path.isExpressionStatement()) continue;

      const loop = path.findParent(path => path.isLoop());
      if (loop) {
        let uid = loop.getData("expressionReplacementReturnUid");

        if (!uid) {
          const callee = this.get("callee");
          uid = callee.scope.generateDeclaredUidIdentifier("ret");
          callee.get("body").pushContainer("body", t.returnStatement(uid));
          loop.setData("expressionReplacementReturnUid", uid);
        } else {
          uid = t.identifier(uid.name);
        }

        path
          .get("expression")
          .replaceWith(t.assignmentExpression("=", uid, path.node.expression));
      } else {
        path.replaceWith(t.returnStatement(path.node.expression));
      }
    }

    this.get("callee").arrowFunctionToExpression();

    return this.node;
  }
}

export function replaceInline(nodes: Object | Array<Object>) {
  this.resync();

  if (Array.isArray(nodes)) {
    if (Array.isArray(this.container)) {
      nodes = this._verifyNodeList(nodes);
      this._containerInsertAfter(nodes);
      return this.remove();
    } else {
      return this.replaceWithMultiple(nodes);
    }
  } else {
    return this.replaceWith(nodes);
  }
}
