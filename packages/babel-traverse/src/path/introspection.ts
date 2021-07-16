// This file contains methods responsible for introspecting the current path for certain values.

import type NodePath from "./index";
import * as t from "@babel/types";

/**
 * Match the current node if it matches the provided `pattern`.
 *
 * For example, given the match `React.createClass` it would match the
 * parsed nodes of `React.createClass` and `React["createClass"]`.
 */

export function matchesPattern(
  this: NodePath,
  pattern: string,
  allowPartial?: boolean,
): boolean {
  return t.matchesPattern(this.node, pattern, allowPartial);
}

/**
 * Check whether we have the input `key`. If the `key` references an array then we check
 * if the array has any items, otherwise we just check if it's falsy.
 */

export function has(this: NodePath, key: string): boolean {
  const val = this.node && this.node[key];
  if (val && Array.isArray(val)) {
    return !!val.length;
  } else {
    return !!val;
  }
}

/**
 * Description
 */

export function isStatic(this: NodePath): boolean {
  return this.scope.isStatic(this.node);
}

/**
 * Alias of `has`.
 */

export const is = has;

/**
 * Opposite of `has`.
 */

export function isnt(this: NodePath, key: string): boolean {
  return !this.has(key);
}

/**
 * Check whether the path node `key` strict equals `value`.
 */

export function equals(this: NodePath, key: string, value): boolean {
  return this.node[key] === value;
}

/**
 * Check the type against our stored internal type of the node. This is handy when a node has
 * been removed yet we still internally know the type and need it to calculate node replacement.
 */

export function isNodeType(this: NodePath, type: string): boolean {
  return t.isType(this.type, type);
}

/**
 * This checks whether or not we're in one of the following positions:
 *
 *   for (KEY in right);
 *   for (KEY;;);
 *
 * This is because these spots allow VariableDeclarations AND normal expressions so we need
 * to tell the path replacement that it's ok to replace this with an expression.
 */

export function canHaveVariableDeclarationOrExpression(this: NodePath) {
  return (
    (this.key === "init" || this.key === "left") && this.parentPath.isFor()
  );
}

/**
 * This checks whether we are swapping an arrow function's body between an
 * expression and a block statement (or vice versa).
 *
 * This is because arrow functions may implicitly return an expression, which
 * is the same as containing a block statement.
 */

export function canSwapBetweenExpressionAndStatement(
  this: NodePath,
  replacement: t.Node,
): boolean {
  if (this.key !== "body" || !this.parentPath.isArrowFunctionExpression()) {
    return false;
  }

  if (this.isExpression()) {
    return t.isBlockStatement(replacement);
  } else if (this.isBlockStatement()) {
    return t.isExpression(replacement);
  }

  return false;
}

/**
 * Check whether the current path references a completion record
 */

export function isCompletionRecord(
  this: NodePath,
  allowInsideFunction?: boolean,
): boolean {
  let path = this;
  let first = true;

  do {
    const container = path.container;

    // we're in a function so can't be a completion record
    if (path.isFunction() && !first) {
      return !!allowInsideFunction;
    }

    first = false;

    // check to see if we're the last item in the container and if we are
    // we're a completion record!
    if (Array.isArray(container) && path.key !== container.length - 1) {
      return false;
    }
  } while ((path = path.parentPath) && !path.isProgram());

  return true;
}

/**
 * Check whether or not the current `key` allows either a single statement or block statement
 * so we can explode it if necessary.
 */

export function isStatementOrBlock(this: NodePath): boolean {
  if (
    this.parentPath.isLabeledStatement() ||
    t.isBlockStatement(this.container)
  ) {
    return false;
  } else {
    return t.STATEMENT_OR_BLOCK_KEYS.includes(this.key as string);
  }
}

/**
 * Check if the currently assigned path references the `importName` of `moduleSource`.
 */

export function referencesImport(
  this: NodePath<t.Expression>,
  moduleSource: string,
  importName: string,
): boolean {
  if (!this.isReferencedIdentifier()) {
    if (
      (this.isMemberExpression() || this.isOptionalMemberExpression()) &&
      (this.node.computed
        ? t.isStringLiteral(this.node.property, { value: importName })
        : (this.node.property as t.Identifier).name === importName)
    ) {
      const object = (
        this as NodePath<t.MemberExpression | t.OptionalMemberExpression>
      ).get("object");
      return (
        object.isReferencedIdentifier() &&
        object.referencesImport(moduleSource, "*")
      );
    }

    return false;
  }

  const binding = this.scope.getBinding((this.node as t.Identifier).name);
  if (!binding || binding.kind !== "module") return false;

  const path = binding.path;
  const parent = path.parentPath;
  if (!parent.isImportDeclaration()) return false;

  // check moduleSource
  if (parent.node.source.value === moduleSource) {
    if (!importName) return true;
  } else {
    return false;
  }

  if (path.isImportDefaultSpecifier() && importName === "default") {
    return true;
  }

  if (path.isImportNamespaceSpecifier() && importName === "*") {
    return true;
  }

  if (
    path.isImportSpecifier() &&
    t.isIdentifier(path.node.imported, { name: importName })
  ) {
    return true;
  }

  return false;
}

/**
 * Get the source code associated with this node.
 */

export function getSource(this: NodePath): string {
  const node = this.node;
  if (node.end) {
    const code = this.hub.getCode();
    if (code) return code.slice(node.start, node.end);
  }
  return "";
}

export function willIMaybeExecuteBefore(this: NodePath, target): boolean {
  return this._guessExecutionStatusRelativeTo(target) !== "after";
}

function getOuterFunction(path: NodePath) {
  return (path.scope.getFunctionParent() || path.scope.getProgramParent()).path;
}

function isExecutionUncertain(type, key) {
  switch (type) {
    // a && FOO
    // a || FOO
    case "LogicalExpression":
      return key === "right";

    // a ? FOO : FOO
    // if (a) FOO; else FOO;
    case "ConditionalExpression":
    case "IfStatement":
      return key === "consequent" || key === "alternate";

    // while (a) FOO;
    case "WhileStatement":
    case "DoWhileStatement":
    case "ForInStatement":
    case "ForOfStatement":
      return key === "body";

    // for (a; b; FOO) FOO;
    case "ForStatement":
      return key === "body" || key === "update";

    // switch (a) { FOO }
    case "SwitchStatement":
      return key === "cases";

    // try { a } catch FOO finally { b }
    case "TryStatement":
      return key === "handler";

    // var [ x = FOO ]
    case "AssignmentPattern":
      return key === "right";

    // a?.[FOO]
    case "OptionalMemberExpression":
      return key === "property";

    // a?.(FOO)
    case "OptionalCallExpression":
      return key === "arguments";

    default:
      return false;
  }
}

function isExecutionUncertainInList(paths, maxIndex) {
  for (let i = 0; i < maxIndex; i++) {
    const path = paths[i];
    if (isExecutionUncertain(path.parent.type, path.parentKey)) {
      return true;
    }
  }
  return false;
}

// TODO (Babel 8)
// This can be { before: boolean, after: boolean, unknown: boolean }.
// This allows transforms like the tdz one to treat cases when the status
// is both before and unknown/after like if it were before.
type RelativeExecutionStatus = "before" | "after" | "unknown";

/**
 * Given a `target` check the execution status of it relative to the current path.
 *
 * "Execution status" simply refers to where or not we **think** this will execute
 * before or after the input `target` element.
 */

export function _guessExecutionStatusRelativeTo(
  this: NodePath,
  target: NodePath,
): RelativeExecutionStatus {
  // check if the two paths are in different functions, we can't track execution of these
  const funcParent = {
    this: getOuterFunction(this),
    target: getOuterFunction(target),
  };

  // here we check the `node` equality as sometimes we may have different paths for the
  // same node due to path thrashing
  if (funcParent.target.node !== funcParent.this.node) {
    return this._guessExecutionStatusRelativeToDifferentFunctions(
      funcParent.target,
    );
  }

  const paths = {
    target: target.getAncestry(),
    this: this.getAncestry(),
  };

  // If this is an ancestor of the target path,
  // e.g. f(g); where this is f and target is g.
  if (paths.target.indexOf(this) >= 0) return "after";
  if (paths.this.indexOf(target) >= 0) return "before";

  // get ancestor where the branches intersect
  let commonPath;
  const commonIndex = { target: 0, this: 0 };

  while (!commonPath && commonIndex.this < paths.this.length) {
    const path = paths.this[commonIndex.this];
    commonIndex.target = paths.target.indexOf(path);
    if (commonIndex.target >= 0) {
      commonPath = path;
    } else {
      commonIndex.this++;
    }
  }

  if (!commonPath) {
    throw new Error(
      "Internal Babel error - The two compared nodes" +
        " don't appear to belong to the same program.",
    );
  }

  if (
    isExecutionUncertainInList(paths.this, commonIndex.this - 1) ||
    isExecutionUncertainInList(paths.target, commonIndex.target - 1)
  ) {
    return "unknown";
  }

  const divergence = {
    this: paths.this[commonIndex.this - 1],
    target: paths.target[commonIndex.target - 1],
  };

  // container list so let's see which one is after the other
  // e.g. [ THIS, TARGET ]
  if (
    divergence.target.listKey &&
    divergence.this.listKey &&
    divergence.target.container === divergence.this.container
  ) {
    return divergence.target.key > divergence.this.key ? "before" : "after";
  }

  // otherwise we're associated by a parent node, check which key comes before the other
  const keys = t.VISITOR_KEYS[commonPath.type];
  const keyPosition = {
    this: keys.indexOf(divergence.this.parentKey as string),
    target: keys.indexOf(divergence.target.parentKey as string),
  };
  return keyPosition.target > keyPosition.this ? "before" : "after";
}

// Used to avoid infinite recursion in cases like
//   function f() { if (false) f(); }
//   f();
// It also works with indirect recursion.
const executionOrderCheckedNodes = new WeakSet();

export function _guessExecutionStatusRelativeToDifferentFunctions(
  this: NodePath,
  target: NodePath,
): RelativeExecutionStatus {
  const targetIsGenericFunctionExpression =
    (target.isArrowFunctionExpression() || target.isFunctionExpression()) &&
    t.isVariableDeclarator(target.parent) &&
    t.isIdentifier(target.parent.id);
  if (
    (!target.isFunctionDeclaration() && !targetIsGenericFunctionExpression) ||
    target.parentPath.isExportDeclaration()
  ) {
    return "unknown";
  }

  // so we're in a completely different function, if this is a function declaration
  // then we can be a bit smarter and handle cases where the function is either
  // a. not called at all (part of an export)
  // b. called directly
  const bindingName = targetIsGenericFunctionExpression
    ? ((target.parent as t.VariableDeclarator).id as t.Identifier).name
    : (target.node as t.FunctionDeclaration).id.name;
  const binding = target.scope.getBinding(bindingName);

  // no references!
  if (!binding.references) return "before";

  const referencePaths: Array<NodePath> = binding.referencePaths;

  let allStatus;

  // verify that all the calls have the same execution status
  for (const path of referencePaths) {
    // if a reference is a child of the function we're checking against then we can
    // safely ignore it
    const childOfFunction = !!path.find(path => path.node === target.node);
    if (childOfFunction) continue;

    if (
      (path.key !== "callee" || !path.parentPath.isCallExpression()) &&
      !path.parentPath.isReturnStatement()
    ) {
      // This function is passed as a reference, so we don't
      // know when it will be called.
      return "unknown";
    }

    // Prevent infinite loops in recursive functions
    if (executionOrderCheckedNodes.has(path.node)) continue;
    executionOrderCheckedNodes.add(path.node);

    const status = this._guessExecutionStatusRelativeTo(path);

    executionOrderCheckedNodes.delete(path.node);

    if (allStatus && allStatus !== status) {
      return "unknown";
    } else {
      allStatus = status;
    }
  }

  return allStatus;
}

/**
 * Resolve a "pointer" `NodePath` to it's absolute path.
 */
export function resolve(this: NodePath, dangerous?, resolved?) {
  return this._resolve(dangerous, resolved) || this;
}

export function _resolve(
  this: NodePath,
  dangerous?,
  resolved?,
): NodePath | undefined | null {
  // detect infinite recursion
  // todo: possibly have a max length on this just to be safe
  if (resolved && resolved.indexOf(this) >= 0) return;

  // we store all the paths we've "resolved" in this array to prevent infinite recursion
  resolved = resolved || [];
  resolved.push(this);

  if (this.isVariableDeclarator()) {
    if (this.get("id").isIdentifier()) {
      return this.get("init").resolve(dangerous, resolved);
    } else {
      // otherwise it's a request for a pattern and that's a bit more tricky
    }
  } else if (this.isReferencedIdentifier()) {
    // @ts-expect-error todo(flow->ts): think about options to improve type refinements
    const binding = this.scope.getBinding(this.node.name);
    if (!binding) return;

    // reassigned so we can't really resolve it
    if (!binding.constant) return;

    // todo - lookup module in dependency graph
    if (binding.kind === "module") return;

    if (binding.path !== this) {
      const ret = binding.path.resolve(dangerous, resolved);
      // If the identifier resolves to parent node then we can't really resolve it.
      if (this.find(parent => parent.node === ret.node)) return;
      return ret;
    }
  } else if (this.isTypeCastExpression()) {
    // @ ts-ignore todo: babel-types
    return this.get("expression").resolve(dangerous, resolved);
  } else if (dangerous && this.isMemberExpression()) {
    // this is dangerous, as non-direct target assignments will mutate it's state
    // making this resolution inaccurate

    const targetKey = this.toComputedKey();
    if (!t.isLiteral(targetKey)) return;

    // @ts-expect-error todo(flow->ts): NullLiteral
    const targetName = targetKey.value;

    const target = this.get("object").resolve(dangerous, resolved);

    if (target.isObjectExpression()) {
      const props = target.get("properties");
      for (const prop of props as any[]) {
        if (!prop.isProperty()) continue;

        const key = prop.get("key");

        // { foo: obj }
        let match =
          prop.isnt("computed") && key.isIdentifier({ name: targetName });

        // { "foo": "obj" } or { ["foo"]: "obj" }
        match = match || key.isLiteral({ value: targetName });

        if (match) return prop.get("value").resolve(dangerous, resolved);
      }
    } else if (target.isArrayExpression() && !isNaN(+targetName)) {
      const elems = target.get("elements");
      const elem = elems[targetName];
      if (elem) return elem.resolve(dangerous, resolved);
    }
  }
}

export function isConstantExpression(this: NodePath) {
  if (this.isIdentifier()) {
    const binding = this.scope.getBinding(this.node.name);
    if (!binding) return false;
    return binding.constant;
  }

  if (this.isLiteral()) {
    if (this.isRegExpLiteral()) {
      return false;
    }

    if (this.isTemplateLiteral()) {
      return this.get("expressions").every(expression =>
        expression.isConstantExpression(),
      );
    }

    return true;
  }

  if (this.isUnaryExpression()) {
    if (this.node.operator !== "void") {
      return false;
    }

    return this.get("argument").isConstantExpression();
  }

  if (this.isBinaryExpression()) {
    return (
      this.get("left").isConstantExpression() &&
      this.get("right").isConstantExpression()
    );
  }

  return false;
}

export function isInStrictMode(this: NodePath) {
  const start = this.isProgram() ? this : this.parentPath;

  const strictParent = start.find(path => {
    if (path.isProgram({ sourceType: "module" })) return true;

    if (path.isClass()) return true;

    if (!path.isProgram() && !path.isFunction()) return false;

    if (
      path.isArrowFunctionExpression() &&
      !path.get("body").isBlockStatement()
    ) {
      return false;
    }

    const body: t.BlockStatement | t.Program = path.isFunction()
      ? (path.node.body as t.BlockStatement)
      : (path.node as t.Program);

    for (const directive of body.directives) {
      if (directive.value.value === "use strict") {
        return true;
      }
    }
  });

  return !!strictParent;
}
