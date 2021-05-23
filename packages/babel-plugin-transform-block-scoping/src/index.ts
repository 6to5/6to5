import { declare } from "@babel/helper-plugin-utils";
import type NodePath from "@babel/traverse";
import type Scope from "@babel/traverse";
import { visitor as tdzVisitor } from "./tdz";
import { traverse, template, types as t } from "@babel/core";

const DONE = new WeakSet();

export default declare((api, opts) => {
  api.assertVersion(7);

  const { throwIfClosureRequired = false, tdz: tdzEnabled = false } = opts;
  if (typeof throwIfClosureRequired !== "boolean") {
    throw new Error(`.throwIfClosureRequired must be a boolean, or undefined`);
  }
  if (typeof tdzEnabled !== "boolean") {
    throw new Error(`.tdz must be a boolean, or undefined`);
  }

  return {
    name: "transform-block-scoping",

    visitor: {
      VariableDeclaration(path) {
        const { node, parent, scope } = path;
        if (!isBlockScoped(node)) return;
        convertBlockScopedToVar(path, null, parent, scope, true);

        if (node._tdzThis) {
          const nodes = [node];

          for (let i = 0; i < node.declarations.length; i++) {
            const decl = node.declarations[i];
            const assign = t.assignmentExpression(
              "=",
              t.cloneNode(decl.id),
              decl.init || scope.buildUndefinedNode(),
            );
            assign._ignoreBlockScopingTDZ = true;
            nodes.push(t.expressionStatement(assign));
            decl.init = this.addHelper("temporalUndefined");
          }

          node._blockHoist = 2;

          if (path.isCompletionRecord()) {
            // ensure we don't break completion record semantics by returning
            // the initialiser of the last declarator
            nodes.push(t.expressionStatement(scope.buildUndefinedNode()));
          }

          path.replaceWithMultiple(nodes);
        }
      },

      Loop(path, state) {
        const { parent, scope } = path;
        path.ensureBlock();
        const blockScoping = new BlockScoping(
          path,
          path.get("body"),
          parent,
          scope,
          throwIfClosureRequired,
          tdzEnabled,
          state,
        );
        const replace = blockScoping.run();
        if (replace) path.replaceWith(replace);
      },

      CatchClause(path, state) {
        const { parent, scope } = path;
        const blockScoping = new BlockScoping(
          null,
          path.get("body"),
          parent,
          scope,
          throwIfClosureRequired,
          tdzEnabled,
          state,
        );
        blockScoping.run();
      },

      "BlockStatement|SwitchStatement|Program"(path, state) {
        if (!ignoreBlock(path)) {
          const blockScoping = new BlockScoping(
            null,
            path,
            path.parent,
            path.scope,
            throwIfClosureRequired,
            tdzEnabled,
            state,
          );
          blockScoping.run();
        }
      },
    },
  };
});

function ignoreBlock(path) {
  return t.isLoop(path.parent) || t.isCatchClause(path.parent);
}

const buildRetCheck = template(`
  if (typeof RETURN === "object") return RETURN.v;
`);

function isBlockScoped(node) {
  if (!t.isVariableDeclaration(node)) return false;
  if (node[t.BLOCK_SCOPED_SYMBOL]) return true;
  if (node.kind !== "let" && node.kind !== "const") return false;
  return true;
}

/**
 * If there is a loop ancestor closer than the closest function, we
 * consider ourselves to be in a loop.
 */
function isInLoop(path) {
  const loopOrFunctionParent = path.find(
    path => path.isLoop() || path.isFunction(),
  );

  return loopOrFunctionParent?.isLoop();
}

function convertBlockScopedToVar(
  path,
  node,
  parent,
  scope,
  moveBindingsToParent = false,
) {
  if (!node) {
    node = path.node;
  }

  // https://github.com/babel/babel/issues/255
  if (isInLoop(path) && !t.isFor(parent)) {
    for (let i = 0; i < node.declarations.length; i++) {
      const declar = node.declarations[i];
      declar.init = declar.init || scope.buildUndefinedNode();
    }
  }

  node[t.BLOCK_SCOPED_SYMBOL] = true;
  node.kind = "var";

  // Move bindings from current block scope to function scope.
  if (moveBindingsToParent) {
    const parentScope = scope.getFunctionParent() || scope.getProgramParent();
    for (const name of Object.keys(path.getBindingIdentifiers())) {
      const binding = scope.getOwnBinding(name);
      if (binding) binding.kind = "var";
      scope.moveBindingTo(name, parentScope);
    }
  }
}

function isVar(node) {
  return t.isVariableDeclaration(node, { kind: "var" }) && !isBlockScoped(node);
}

const letReferenceBlockVisitor = traverse.visitors.merge([
  {
    Loop: {
      enter(path, state) {
        state.loopDepth++;
      },
      exit(path, state) {
        state.loopDepth--;
      },
    },
    FunctionParent(path, state) {
      // References to block-scoped variables only require added closures if it's
      // possible for the code to run more than once -- otherwise it is safe to
      // simply rename the variables.
      if (state.loopDepth > 0) {
        path.traverse(letReferenceFunctionVisitor, state);
      } else {
        path.traverse(tdzVisitor, state);
      }
      return path.skip();
    },
  },
  tdzVisitor,
]);

const letReferenceFunctionVisitor = traverse.visitors.merge([
  {
    ReferencedIdentifier(path, state) {
      const ref = state.letReferences.get(path.node.name);

      // not a part of our scope
      if (!ref) return;

      // this scope has a variable with the same name so it couldn't belong
      // to our let scope
      const localBinding = path.scope.getBindingIdentifier(path.node.name);
      if (localBinding && localBinding !== ref) return;

      state.closurify = true;
    },
  },
  tdzVisitor,
]);

const hoistVarDeclarationsVisitor = {
  enter(path, self) {
    const { node, parent } = path;

    if (path.isForStatement()) {
      if (isVar(node.init, node)) {
        const nodes = self.pushDeclar(node.init);
        if (nodes.length === 1) {
          node.init = nodes[0];
        } else {
          node.init = t.sequenceExpression(nodes);
        }
      }
    } else if (path.isFor()) {
      if (isVar(node.left, node)) {
        self.pushDeclar(node.left);
        node.left = node.left.declarations[0].id;
      }
    } else if (isVar(node, parent)) {
      path.replaceWithMultiple(
        self.pushDeclar(node).map(expr => t.expressionStatement(expr)),
      );
    } else if (path.isFunction()) {
      return path.skip();
    }
  },
};

const loopLabelVisitor = {
  LabeledStatement({ node }, state) {
    state.innerLabels.push(node.label.name);
  },
};

const continuationVisitor = {
  enter(path, state) {
    if (path.isAssignmentExpression() || path.isUpdateExpression()) {
      for (const name of Object.keys(path.getBindingIdentifiers())) {
        if (
          state.outsideReferences.get(name) !==
          path.scope.getBindingIdentifier(name)
        ) {
          continue;
        }
        state.reassignments[name] = true;
      }
    } else if (path.isReturnStatement()) {
      state.returnStatements.push(path);
    }
  },
};

function loopNodeTo(node) {
  if (t.isBreakStatement(node)) {
    return "break";
  } else if (t.isContinueStatement(node)) {
    return "continue";
  }
}

const loopVisitor = {
  Loop(path, state) {
    const oldIgnoreLabeless = state.ignoreLabeless;
    state.ignoreLabeless = true;
    path.traverse(loopVisitor, state);
    state.ignoreLabeless = oldIgnoreLabeless;
    path.skip();
  },

  Function(path) {
    path.skip();
  },

  SwitchCase(path, state) {
    const oldInSwitchCase = state.inSwitchCase;
    state.inSwitchCase = true;
    path.traverse(loopVisitor, state);
    state.inSwitchCase = oldInSwitchCase;
    path.skip();
  },

  "BreakStatement|ContinueStatement|ReturnStatement"(path, state) {
    const { node, scope } = path;
    if (node[this.LOOP_IGNORE]) return;

    let replace;
    let loopText = loopNodeTo(node);

    if (loopText) {
      if (node.label) {
        // we shouldn't be transforming this because it exists somewhere inside
        if (state.innerLabels.indexOf(node.label.name) >= 0) {
          return;
        }

        loopText = `${loopText}|${node.label.name}`;
      } else {
        // we shouldn't be transforming these statements because
        // they don't refer to the actual loop we're scopifying
        if (state.ignoreLabeless) return;

        // break statements mean something different in this context
        if (t.isBreakStatement(node) && state.inSwitchCase) return;
      }

      state.hasBreakContinue = true;
      state.map[loopText] = node;
      replace = t.stringLiteral(loopText);
    }

    if (path.isReturnStatement()) {
      state.hasReturn = true;
      replace = t.objectExpression([
        t.objectProperty(
          t.identifier("v"),
          node.argument || scope.buildUndefinedNode(),
        ),
      ]);
    }

    if (replace) {
      replace = t.returnStatement(replace);
      replace[this.LOOP_IGNORE] = true;
      path.skip();
      path.replaceWith(t.inherits(replace, node));
    }
  },
};

function isStrict(path) {
  return !!path.find(({ node }) => {
    if (t.isProgram(node)) {
      if (node.sourceType === "module") return true;
    } else if (!t.isBlockStatement(node)) return false;

    return node.directives.some(
      directive => directive.value.value === "use strict",
    );
  });
}

class BlockScoping {
  constructor(
    loopPath?: NodePath,
    blockPath: NodePath,
    parent: Object,
    scope: Scope,
    throwIfClosureRequired: boolean,
    tdzEnabled: boolean,
    state: Object,
  ) {
    this.parent = parent;
    this.scope = scope;
    this.state = state;
    this.throwIfClosureRequired = throwIfClosureRequired;
    this.tdzEnabled = tdzEnabled;

    this.blockPath = blockPath;
    this.block = blockPath.node;

    this.outsideLetReferences = new Map();
    this.hasLetReferences = false;
    this.letReferences = new Map();
    this.body = [];

    if (loopPath) {
      this.loopParent = loopPath.parent;
      this.loopLabel =
        t.isLabeledStatement(this.loopParent) && this.loopParent.label;
      this.loopPath = loopPath;
      this.loop = loopPath.node;
    }
  }

  /**
   * Start the ball rolling.
   */

  run() {
    const block = this.block;
    if (DONE.has(block)) return;
    DONE.add(block);

    const needsClosure = this.getLetReferences();

    this.checkConstants();

    // this is a block within a `Function/Program` so we can safely leave it be
    if (t.isFunction(this.parent) || t.isProgram(this.block)) {
      this.updateScopeInfo();
      return;
    }

    // we can skip everything
    if (!this.hasLetReferences) return;

    if (needsClosure) {
      this.wrapClosure();
    } else {
      this.remap();
    }

    this.updateScopeInfo(needsClosure);

    if (this.loopLabel && !t.isLabeledStatement(this.loopParent)) {
      return t.labeledStatement(this.loopLabel, this.loop);
    }
  }

  checkConstants() {
    const scope = this.scope;
    const state = this.state;

    for (const name of Object.keys(scope.bindings)) {
      const binding = scope.bindings[name];
      if (binding.kind !== "const") continue;

      for (const violation of (binding.constantViolations: Array)) {
        const readOnlyError = state.addHelper("readOnlyError");
        const throwNode = t.callExpression(readOnlyError, [
          t.stringLiteral(name),
        ]);

        if (violation.isAssignmentExpression()) {
          const { operator } = violation.node;
          if (operator === "=") {
            violation.replaceWith(
              t.sequenceExpression([violation.get("right").node, throwNode]),
            );
          } else if (["&&=", "||=", "??="].includes(operator)) {
            violation.replaceWith(
              t.logicalExpression(
                operator.slice(0, -1),
                violation.get("left").node,
                t.sequenceExpression([violation.get("right").node, throwNode]),
              ),
            );
          } else {
            violation.replaceWith(
              t.sequenceExpression([
                t.binaryExpression(
                  operator.slice(0, -1),
                  violation.get("left").node,
                  violation.get("right").node,
                ),
                throwNode,
              ]),
            );
          }
        } else if (violation.isUpdateExpression()) {
          violation.replaceWith(
            t.sequenceExpression([
              t.unaryExpression("+", violation.get("argument").node),
              throwNode,
            ]),
          );
        } else if (violation.isForXStatement()) {
          violation.ensureBlock();
          violation
            .get("left")
            .replaceWith(
              t.variableDeclaration("var", [
                t.variableDeclarator(
                  violation.scope.generateUidIdentifier(name),
                ),
              ]),
            );
          violation.node.body.body.unshift(t.expressionStatement(throwNode));
        }
      }
    }
  }

  updateScopeInfo(wrappedInClosure) {
    const blockScope = this.blockPath.scope;

    const parentScope =
      blockScope.getFunctionParent() || blockScope.getProgramParent();
    const letRefs = this.letReferences;

    for (const key of letRefs.keys()) {
      const ref = letRefs.get(key);
      const binding = blockScope.getBinding(ref.name);
      if (!binding) continue;
      if (binding.kind === "let" || binding.kind === "const") {
        binding.kind = "var";

        if (wrappedInClosure) {
          if (blockScope.hasOwnBinding(ref.name)) {
            blockScope.removeBinding(ref.name);
          }
        } else {
          blockScope.moveBindingTo(ref.name, parentScope);
        }
      }
    }
  }

  remap() {
    const letRefs = this.letReferences;
    const outsideLetRefs = this.outsideLetReferences;
    const scope = this.scope;
    const blockPathScope = this.blockPath.scope;

    // alright, so since we aren't wrapping this block in a closure
    // we have to check if any of our let variables collide with
    // those in upper scopes and then if they do, generate a uid
    // for them and replace all references with it

    for (const key of letRefs.keys()) {
      // just an Identifier node we collected in `getLetReferences`
      // this is the defining identifier of a declaration
      const ref = letRefs.get(key);

      // todo: could skip this if the colliding binding is in another function
      if (scope.parentHasBinding(key) || scope.hasGlobal(key)) {
        const binding = scope.getOwnBinding(key);
        if (binding) {
          const parentBinding = scope.parent.getOwnBinding(key);
          if (
            binding.kind === "hoisted" &&
            !binding.path.node.async &&
            !binding.path.node.generator &&
            (!parentBinding || isVar(parentBinding.path.parent)) &&
            !isStrict(binding.path.parentPath)
          ) {
            continue;
          }
          // The same identifier might have been bound separately in the block scope and
          // the enclosing scope (e.g. loop or catch statement), so we should handle both
          // individually
          scope.rename(ref.name);
        }

        if (blockPathScope.hasOwnBinding(key)) {
          blockPathScope.rename(ref.name);
        }
      }
    }

    for (const key of outsideLetRefs.keys()) {
      const ref = letRefs.get(key);
      // check for collisions with a for loop's init variable and the enclosing scope's bindings
      // https://github.com/babel/babel/issues/8498
      if (isInLoop(this.blockPath) && blockPathScope.hasOwnBinding(key)) {
        blockPathScope.rename(ref.name);
      }
    }
  }

  wrapClosure() {
    if (this.throwIfClosureRequired) {
      throw this.blockPath.buildCodeFrameError(
        "Compiling let/const in this block would add a closure " +
          "(throwIfClosureRequired).",
      );
    }
    const block = this.block;

    const outsideRefs = this.outsideLetReferences;

    // remap loop heads with colliding variables
    if (this.loop) {
      // nb: clone outsideRefs keys since the map is modified within the loop
      for (const name of Array.from(outsideRefs.keys())) {
        const id = outsideRefs.get(name);

        if (
          this.scope.hasGlobal(id.name) ||
          this.scope.parentHasBinding(id.name)
        ) {
          outsideRefs.delete(id.name);
          this.letReferences.delete(id.name);

          this.scope.rename(id.name);

          this.letReferences.set(id.name, id);
          outsideRefs.set(id.name, id);
        }
      }
    }

    // if we're inside of a for loop then we search to see if there are any
    // `break`s, `continue`s, `return`s etc
    this.has = this.checkLoop();

    // hoist let references to retain scope
    this.hoistVarDeclarations();

    // turn outsideLetReferences into an array
    const args = Array.from(outsideRefs.values(), node => t.cloneNode(node));
    const params = args.map(id => t.cloneNode(id));

    const isSwitch = this.blockPath.isSwitchStatement();

    // build the closure that we're going to wrap the block with, possible wrapping switch(){}
    const fn = t.functionExpression(
      null,
      params,
      t.blockStatement(isSwitch ? [block] : block.body),
    );

    // continuation
    this.addContinuations(fn);

    let call = t.callExpression(t.nullLiteral(), args);
    let basePath = ".callee";

    // handle generators
    const hasYield = traverse.hasType(
      fn.body,
      "YieldExpression",
      t.FUNCTION_TYPES,
    );
    if (hasYield) {
      fn.generator = true;
      call = t.yieldExpression(call, true);
      basePath = ".argument" + basePath;
    }

    // handlers async functions
    const hasAsync = traverse.hasType(
      fn.body,
      "AwaitExpression",
      t.FUNCTION_TYPES,
    );
    if (hasAsync) {
      fn.async = true;
      call = t.awaitExpression(call);
      basePath = ".argument" + basePath;
    }

    let placeholderPath;
    let index;
    if (this.has.hasReturn || this.has.hasBreakContinue) {
      const ret = this.scope.generateUid("ret");

      this.body.push(
        t.variableDeclaration("var", [
          t.variableDeclarator(t.identifier(ret), call),
        ]),
      );
      placeholderPath = "declarations.0.init" + basePath;
      index = this.body.length - 1;

      this.buildHas(ret);
    } else {
      this.body.push(t.expressionStatement(call));
      placeholderPath = "expression" + basePath;
      index = this.body.length - 1;
    }

    let callPath;
    // replace the current block body with the one we're going to build
    if (isSwitch) {
      const { parentPath, listKey, key } = this.blockPath;

      this.blockPath.replaceWithMultiple(this.body);
      callPath = parentPath.get(listKey)[key + index];
    } else {
      block.body = this.body;
      callPath = this.blockPath.get("body")[index];
    }

    const placeholder = callPath.get(placeholderPath);

    let fnPath;
    if (this.loop) {
      const loopId = this.scope.generateUid("loop");
      const p = this.loopPath.insertBefore(
        t.variableDeclaration("var", [
          t.variableDeclarator(t.identifier(loopId), fn),
        ]),
      );

      placeholder.replaceWith(t.identifier(loopId));
      fnPath = p[0].get("declarations.0.init");
    } else {
      placeholder.replaceWith(fn);
      fnPath = placeholder;
    }

    // Ensure "this", "arguments", and "super" continue to work in the wrapped function.
    fnPath.unwrapFunctionEnvironment();
  }

  /**
   * If any of the outer let variables are reassigned then we need to rename them in
   * the closure so we can get direct access to the outer variable to continue the
   * iteration with bindings based on each iteration.
   *
   * Reference: https://github.com/babel/babel/issues/1078
   */

  addContinuations(fn) {
    const state = {
      reassignments: {},
      returnStatements: [],
      outsideReferences: this.outsideLetReferences,
    };

    this.scope.traverse(fn, continuationVisitor, state);

    for (let i = 0; i < fn.params.length; i++) {
      const param = fn.params[i];
      if (!state.reassignments[param.name]) continue;

      const paramName = param.name;
      const newParamName = this.scope.generateUid(param.name);
      fn.params[i] = t.identifier(newParamName);

      this.scope.rename(paramName, newParamName, fn);

      state.returnStatements.forEach(returnStatement => {
        returnStatement.insertBefore(
          t.expressionStatement(
            t.assignmentExpression(
              "=",
              t.identifier(paramName),
              t.identifier(newParamName),
            ),
          ),
        );
      });

      // assign outer reference as it's been modified internally and needs to be retained
      fn.body.body.push(
        t.expressionStatement(
          t.assignmentExpression(
            "=",
            t.identifier(paramName),
            t.identifier(newParamName),
          ),
        ),
      );
    }
  }

  getLetReferences() {
    const block = this.block;

    const declarators = [];

    if (this.loop) {
      const init = this.loop.left || this.loop.init;
      if (isBlockScoped(init)) {
        declarators.push(init);
        const names = t.getBindingIdentifiers(init);
        for (const name of Object.keys(names)) {
          this.outsideLetReferences.set(name, names[name]);
        }
      }
    }

    const addDeclarationsFromChild = (path, node) => {
      node = node || path.node;
      if (
        t.isClassDeclaration(node) ||
        t.isFunctionDeclaration(node) ||
        isBlockScoped(node)
      ) {
        if (isBlockScoped(node)) {
          convertBlockScopedToVar(path, node, block, this.scope);
        }
        if (node.declarations) {
          for (let i = 0; i < node.declarations.length; i++) {
            declarators.push(node.declarations[i]);
          }
        } else {
          declarators.push(node);
        }
      }
      if (t.isLabeledStatement(node)) {
        addDeclarationsFromChild(path.get("body"), node.body);
      }
    };

    //
    if (block.body) {
      const declarPaths = this.blockPath.get("body");
      for (let i = 0; i < block.body.length; i++) {
        addDeclarationsFromChild(declarPaths[i]);
      }
    }

    if (block.cases) {
      const declarPaths = this.blockPath.get("cases");
      for (let i = 0; i < block.cases.length; i++) {
        const consequents = block.cases[i].consequent;

        for (let j = 0; j < consequents.length; j++) {
          const declar = consequents[j];
          addDeclarationsFromChild(declarPaths[i], declar);
        }
      }
    }

    //
    for (let i = 0; i < declarators.length; i++) {
      const declar = declarators[i];
      // Passing true as the third argument causes t.getBindingIdentifiers
      // to return only the *outer* binding identifiers of this
      // declaration, rather than (for example) mistakenly including the
      // parameters of a function declaration. Fixes #4880.
      const keys = t.getBindingIdentifiers(declar, false, true);
      for (const key of Object.keys(keys)) {
        this.letReferences.set(key, keys[key]);
      }
      this.hasLetReferences = true;
    }

    // no let references so we can just quit
    if (!this.hasLetReferences) return;

    const state = {
      letReferences: this.letReferences,
      closurify: false,
      loopDepth: 0,
      tdzEnabled: this.tdzEnabled,
      addHelper: name => this.state.addHelper(name),
    };

    if (isInLoop(this.blockPath)) {
      state.loopDepth++;
    }

    // traverse through this block, stopping on functions and checking if they
    // contain any local let references
    this.blockPath.traverse(letReferenceBlockVisitor, state);

    return state.closurify;
  }

  /**
   * If we're inside of a loop then traverse it and check if it has one of
   * the following node types `ReturnStatement`, `BreakStatement`,
   * `ContinueStatement` and replace it with a return value that we can track
   * later on.
   */

  checkLoop(): Object {
    const state = {
      hasBreakContinue: false,
      ignoreLabeless: false,
      inSwitchCase: false,
      innerLabels: [],
      hasReturn: false,
      isLoop: !!this.loop,
      map: {},
      LOOP_IGNORE: Symbol(),
    };

    this.blockPath.traverse(loopLabelVisitor, state);
    this.blockPath.traverse(loopVisitor, state);

    return state;
  }

  /**
   * Hoist all let declarations in this block to before it so they retain scope
   * once we wrap everything in a closure.
   */

  hoistVarDeclarations() {
    this.blockPath.traverse(hoistVarDeclarationsVisitor, this);
  }

  /**
   * Turn a `VariableDeclaration` into an array of `AssignmentExpressions` with
   * their declarations hoisted to before the closure wrapper.
   */

  pushDeclar(node: { type: "VariableDeclaration" }): Array<Object> {
    const declars = [];
    const names = t.getBindingIdentifiers(node);
    for (const name of Object.keys(names)) {
      declars.push(t.variableDeclarator(names[name]));
    }

    this.body.push(t.variableDeclaration(node.kind, declars));

    const replace = [];

    for (let i = 0; i < node.declarations.length; i++) {
      const declar = node.declarations[i];
      if (!declar.init) continue;

      const expr = t.assignmentExpression(
        "=",
        t.cloneNode(declar.id),
        t.cloneNode(declar.init),
      );
      replace.push(t.inherits(expr, declar));
    }

    return replace;
  }

  buildHas(ret: string) {
    const body = this.body;
    const has = this.has;

    if (has.hasBreakContinue) {
      for (const key of Object.keys(has.map)) {
        body.push(
          t.ifStatement(
            t.binaryExpression("===", t.identifier(ret), t.stringLiteral(key)),
            has.map[key],
          ),
        );
      }
    }

    // typeof ret === "object"
    if (has.hasReturn) {
      body.push(
        buildRetCheck({
          RETURN: t.identifier(ret),
        }),
      );
    }
  }
}
