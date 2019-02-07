import type { NodePath } from "@babel/traverse";
import nameFunction from "@babel/helper-function-name";
import ReplaceSupers, {
  environmentVisitor,
} from "@babel/helper-replace-supers";
import optimiseCall from "@babel/helper-optimise-call-expression";
import * as defineMap from "@babel/helper-define-map";
import { traverse, template, types as t } from "@babel/core";

type ReadonlySet<T> = Set<T> | { has(val: T): boolean };

function buildConstructor(classRef, constructorBody, node) {
  const func = t.functionDeclaration(
    t.cloneNode(classRef),
    [],
    constructorBody,
  );
  t.inherits(func, node);
  return func;
}

function findNearestBlock(p) {
  let last = p;
  return p.find(p => {
    if (p.isBlockParent() || p.isSequenceExpression()) {
      // exclude CallExpression as an object key name.
      if (last && p.isMethod({ key: last.node })) {
        return false;
      }
      return true;
    }
    last = p;
  });
}

const checkSuperCalleeVisitor = traverse.visitors.merge([
  environmentVisitor,
  {
    Super(path, state) {
      const { node, parentPath } = path;
      if (
        parentPath.isCallExpression({ callee: node }) &&
        !isInConditional(parentPath, state.root)
      ) {
        state.path = path;
        path.stop();
      }
    },
  },
]);

function findPrevSiblingSuper(p) {
  let ret;
  return (
    p.getAllPrevSiblings().some(p => {
      const state = { path: null, root: p };
      return p.traverse(checkSuperCalleeVisitor, state), (ret = state.path);
    }) && ret
  );
}

function isInConditional(p, ref) {
  do {
    if (p.isConditional() || p.isLogicalExpression() || p.isSwitchStatement()) {
      return true;
    } else if (p === ref) return false;
  } while ((p = p.parentPath));
  return false;
}

function findUp(p, fn) {
  do {
    if (!p || p.isClassBody()) return false;
    else if (fn(p)) return p;
  } while ((p = p.parentPath));
  return false;
}

// Check block assertion of `assertThisInitialized`
const isThisAsserted = p =>
  findUp(p, p => !!p.getData("_assertThisInitialized"));

// Find `super()` in forwards and upwards
const findUpwardsSuper = p => {
  let ret;
  return (
    findUp(p, p => !!(ret = findPrevSiblingSuper(p.getStatementParent()))), ret
  );
};

// Add path with assertThisInitialized flag
const setThisAssert = p => {
  const b = findNearestBlock(p);
  b && b.setData("_assertThisInitialized", 1);
};

const verifyConstructorVisitor = traverse.visitors.merge([
  environmentVisitor,
  {
    Super(path, state) {
      if (state.isDerived) return;

      const { node, parentPath } = path;
      if (parentPath.isCallExpression({ callee: node })) {
        throw path.buildCodeFrameError(
          "super() is only allowed in a derived constructor",
        );
      }
    },
    ThisExpression(path, state) {
      const { isDerived, superThises, ctorThises } = state;

      ctorThises.push(path);

      // keep cache superThises for wrapSuperCall()
      if (isDerived) {
        superThises.push(path);
      }

      path.skip();
    },
  },
]);

export default function transformClass(
  path: NodePath,
  file: any,
  builtinClasses: ReadonlySet<string>,
  isLoose: boolean,
) {
  const classState = {
    parent: undefined,
    scope: undefined,
    node: undefined,
    path: undefined,
    file: undefined,

    classId: undefined,
    classRef: undefined,
    superName: undefined,
    superReturns: [],
    isDerived: false,
    extendsNative: false,

    construct: undefined,
    constructorBody: undefined,
    userConstructor: undefined,
    userConstructorPath: undefined,
    hasConstructor: false,

    instancePropBody: [],
    instancePropRefs: {},
    staticPropBody: [],
    body: [],
    bareSupers: [],
    ctorThises: [],
    superThises: [],
    pushedConstructor: false,
    pushedInherits: false,
    protoAlias: null,
    isLoose: false,

    hasInstanceDescriptors: false,
    hasStaticDescriptors: false,
    instanceMutatorMap: {},
    staticMutatorMap: {},
  };

  const setState = newState => {
    Object.assign(classState, newState);
  };

  function pushToMap(node, enumerable, kind = "value", scope?) {
    let mutatorMap;
    if (node.static) {
      setState({ hasStaticDescriptors: true });
      mutatorMap = classState.staticMutatorMap;
    } else {
      setState({ hasInstanceDescriptors: true });
      mutatorMap = classState.instanceMutatorMap;
    }

    const map = defineMap.push(mutatorMap, node, kind, classState.file, scope);

    if (enumerable) {
      map.enumerable = t.booleanLiteral(true);
    }

    return map;
  }

  /**
   * Creates a class constructor or bail out if there is none
   */
  function maybeCreateConstructor() {
    let hasConstructor = false;
    const paths = classState.path.get("body.body");
    for (const path of paths) {
      hasConstructor = path.equals("kind", "constructor");
      if (hasConstructor) break;
    }
    if (hasConstructor) return;

    let params, body;

    if (classState.isDerived) {
      const constructor = template.expression.ast`
        (function () {
          super(...arguments);
        })
      `;
      params = constructor.params;
      body = constructor.body;
    } else {
      params = [];
      body = t.blockStatement([]);
    }

    classState.path
      .get("body")
      .unshiftContainer(
        "body",
        t.classMethod("constructor", t.identifier("constructor"), params, body),
      );
  }

  function buildBody() {
    maybeCreateConstructor();
    pushBody();
    verifyConstructor();

    if (classState.userConstructor) {
      const { constructorBody, userConstructor, construct } = classState;
      constructorBody.body = constructorBody.body.concat(
        userConstructor.body.body,
      );
      t.inherits(construct, userConstructor);
      t.inherits(constructorBody, userConstructor.body);
    }

    pushDescriptors();
  }

  function pushBody() {
    const classBodyPaths: Array<Object> = classState.path.get("body.body");

    for (const path of classBodyPaths) {
      const node = path.node;

      if (path.isClassProperty()) {
        throw path.buildCodeFrameError("Missing class properties transform.");
      }

      if (node.decorators) {
        throw path.buildCodeFrameError(
          "Method has decorators, put the decorator plugin before the classes one.",
        );
      }

      if (t.isClassMethod(node)) {
        const isConstructor = node.kind === "constructor";

        const replaceSupers = new ReplaceSupers({
          methodPath: path,
          objectRef: classState.classRef,
          superRef: classState.superName,
          isLoose: classState.isLoose,
          file: classState.file,
        });

        replaceSupers.replace();

        if (isConstructor) {
          // TODO this needs to be cleaned up. But, one step at a time.
          const state = {
            returns: [],
            bareSupers: [],
          };
          path.traverse(
            traverse.visitors.merge([
              environmentVisitor,
              {
                ReturnStatement(path, state) {
                  if (!path.getFunctionParent().isArrowFunctionExpression()) {
                    state.returns.push(path);
                  }
                },

                Super(path, state) {
                  const { node, parentPath } = path;
                  if (parentPath.isCallExpression({ callee: node })) {
                    state.bareSupers.push(parentPath);
                  }
                },
              },
            ]),
            state,
          );

          pushConstructor(state, node, path);
        } else {
          pushMethod(node, path);
        }
      }
    }
  }

  function clearDescriptors() {
    setState({
      hasInstanceDescriptors: false,
      hasStaticDescriptors: false,
      instanceMutatorMap: {},
      staticMutatorMap: {},
    });
  }

  function pushDescriptors() {
    pushInheritsToBody();

    const { body } = classState;

    let instanceProps;
    let staticProps;

    if (classState.hasInstanceDescriptors) {
      instanceProps = defineMap.toClassObject(classState.instanceMutatorMap);
    }

    if (classState.hasStaticDescriptors) {
      staticProps = defineMap.toClassObject(classState.staticMutatorMap);
    }

    if (instanceProps || staticProps) {
      if (instanceProps) {
        instanceProps = defineMap.toComputedObjectFromClass(instanceProps);
      }
      if (staticProps) {
        staticProps = defineMap.toComputedObjectFromClass(staticProps);
      }

      let args = [
        t.cloneNode(classState.classRef), // Constructor
        t.nullLiteral(), // instanceDescriptors
        t.nullLiteral(), // staticDescriptors
      ];

      if (instanceProps) args[1] = instanceProps;
      if (staticProps) args[2] = staticProps;

      let lastNonNullIndex = 0;
      for (let i = 0; i < args.length; i++) {
        if (!t.isNullLiteral(args[i])) lastNonNullIndex = i;
      }
      args = args.slice(0, lastNonNullIndex + 1);

      body.push(
        t.expressionStatement(
          t.callExpression(classState.file.addHelper("createClass"), args),
        ),
      );
    }

    clearDescriptors();
  }

  function wrapSuperCall(bareSuper, superRef, thisRef, body) {
    let bareSuperNode = bareSuper.node;
    let call;

    if (classState.isLoose) {
      bareSuperNode.arguments.unshift(t.thisExpression());
      if (
        bareSuperNode.arguments.length === 2 &&
        t.isSpreadElement(bareSuperNode.arguments[1]) &&
        t.isIdentifier(bareSuperNode.arguments[1].argument, {
          name: "arguments",
        })
      ) {
        // special case single arguments spread
        bareSuperNode.arguments[1] = bareSuperNode.arguments[1].argument;
        bareSuperNode.callee = t.memberExpression(
          t.cloneNode(superRef),
          t.identifier("apply"),
        );
      } else {
        bareSuperNode.callee = t.memberExpression(
          t.cloneNode(superRef),
          t.identifier("call"),
        );
      }

      call = t.logicalExpression("||", bareSuperNode, t.thisExpression());
    } else {
      bareSuperNode = optimiseCall(
        t.callExpression(classState.file.addHelper("getPrototypeOf"), [
          t.cloneNode(classState.classRef),
        ]),
        t.thisExpression(),
        bareSuperNode.arguments,
      );

      call = t.callExpression(
        classState.file.addHelper("possibleConstructorReturn"),
        [t.thisExpression(), bareSuperNode],
      );
    }

    if (
      bareSuper.parentPath.isExpressionStatement() &&
      bareSuper.parentPath.container === body.node.body &&
      body.node.body.length - 1 === bareSuper.parentPath.key
    ) {
      // this super call is the last statement in the body so we can just straight up
      // turn it into a return

      if (classState.superThises.length) {
        call = t.assignmentExpression("=", thisRef(), call);
      }

      bareSuper.parentPath.replaceWith(t.returnStatement(call));
    } else {
      bareSuper.replaceWith(t.assignmentExpression("=", thisRef(), call));
    }
  }

  function verifyConstructor() {
    const {
      userConstructorPath: path,
      isDerived,
      file,
      bareSupers,
      ctorThises,
    } = classState;
    if (!path) return;

    const body = path.get("body");

    path.traverse(verifyConstructorVisitor, classState);

    const thisRef = () => {
      let ref;
      if ((ref = thisRef.ref)) {
        return t.cloneNode(ref);
      }
      // Avoid always assigning this if ctorThises count more than 1
      if (isDerived || ctorThises.length > 1) {
        ref = path.scope.generateUidIdentifier("this");
        path.scope.push({
          id: ref,
          init: (thisRef.thisAlias = !isDerived ? t.thisExpression() : null),
        });
      } else {
        ref = t.thisExpression();
      }
      return (thisRef.ref = ref);
    };

    // Traverse THIS within constructor for some verifies and fixtures.
    for (const path of ctorThises) {
      const { node } = path;
      if (node === thisRef.thisAlias) continue;

      // Fix issue #8335, traverse all of the `this` expressions with assertion and aliases
      if (isDerived && !isThisAsserted(path)) {
        const superPath = findUpwardsSuper(path);
        if (superPath) {
          setThisAssert(superPath);
        } else {
          const block = findNearestBlock(path);
          const stateLine = path.find(p => p.parentPath === block);

          // Prevent add `assertThisInitialized` if find `super()` before current statement
          if (findPrevSiblingSuper(stateLine)) {
            setThisAssert(path);
            if (block.isSequenceExpression() && !isInConditional(block, body)) {
              setThisAssert(body);
            }
          } else {
            const assertion = t.callExpression(
              file.addHelper("assertThisInitialized"),
              [thisRef()],
            );
            if (!isInConditional(path, stateLine)) {
              // skip mark if in condtional
              setThisAssert(path);
            }
            path.replaceWith(assertion);
            continue;
          }
        }
      }

      // this => _this
      path.replaceWith(thisRef());
    }

    if (!isDerived) return;

    let guaranteedSuperBeforeFinish = !!bareSupers.length;
    for (const bareSuper of bareSupers) {
      wrapSuperCall(bareSuper, classState.superName, thisRef, body);

      if (guaranteedSuperBeforeFinish) {
        bareSuper.find(function(parentPath) {
          // hit top so short circuit
          if (parentPath === path) {
            return true;
          }

          if (
            parentPath.isLoop() ||
            parentPath.isConditional() ||
            parentPath.isArrowFunctionExpression()
          ) {
            guaranteedSuperBeforeFinish = false;
            return true;
          }
        });
      }
    }

    let wrapReturn;

    if (classState.isLoose) {
      wrapReturn = returnArg => {
        const thisExpr = isThisAsserted(body)
          ? thisRef()
          : t.callExpression(file.addHelper("assertThisInitialized"), [
              thisRef(),
            ]);
        return returnArg
          ? t.logicalExpression("||", returnArg, thisExpr)
          : thisExpr;
      };
    } else {
      wrapReturn = returnArg => {
        return isThisAsserted(body)
          ? returnArg
            ? t.logicalExpression("||", returnArg, thisRef())
            : thisRef()
          : t.callExpression(
              file.addHelper("possibleConstructorReturn"),
              [thisRef()].concat(returnArg || []),
            );
      };
    }

    // if we have a return as the last node in the body then we've already caught that
    // return
    const bodyPaths = body.get("body");
    if (!bodyPaths.length || !bodyPaths.pop().isReturnStatement()) {
      body.pushContainer(
        "body",
        t.returnStatement(
          guaranteedSuperBeforeFinish ? thisRef() : wrapReturn(),
        ),
      );
    }

    for (const returnPath of classState.superReturns) {
      returnPath
        .get("argument")
        .replaceWith(wrapReturn(returnPath.node.argument));
    }
  }

  /**
   * Push a method to its respective mutatorMap.
   */
  function pushMethod(node: { type: "ClassMethod" }, path?: NodePath) {
    const scope = path ? path.scope : classState.scope;

    if (node.kind === "method") {
      if (processMethod(node, scope)) return;
    }

    pushToMap(node, false, null, scope);
  }

  function processMethod(node, scope) {
    if (classState.isLoose && !node.decorators) {
      // use assignments instead of define properties for loose classes
      let { classRef } = classState;
      if (!node.static) {
        insertProtoAliasOnce();
        classRef = classState.protoAlias;
      }
      const methodName = t.memberExpression(
        t.cloneNode(classRef),
        node.key,
        node.computed || t.isLiteral(node.key),
      );

      let func = t.functionExpression(
        null,
        node.params,
        node.body,
        node.generator,
        node.async,
      );
      t.inherits(func, node);

      const key = t.toComputedKey(node, node.key);
      if (t.isStringLiteral(key)) {
        func = nameFunction({
          node: func,
          id: key,
          scope,
        });
      }

      const expr = t.expressionStatement(
        t.assignmentExpression("=", methodName, func),
      );
      t.inheritsComments(expr, node);
      classState.body.push(expr);
      return true;
    }

    return false;
  }

  function insertProtoAliasOnce() {
    if (classState.protoAlias === null) {
      setState({ protoAlias: classState.scope.generateUidIdentifier("proto") });
      const classProto = t.memberExpression(
        classState.classRef,
        t.identifier("prototype"),
      );
      const protoDeclaration = t.variableDeclaration("var", [
        t.variableDeclarator(classState.protoAlias, classProto),
      ]);

      classState.body.push(protoDeclaration);
    }
  }

  /**
   * Replace the constructor body of our class.
   */
  function pushConstructor(
    replaceSupers,
    method: { type: "ClassMethod" },
    path: NodePath,
  ) {
    // https://github.com/babel/babel/issues/1077
    if (path.scope.hasOwnBinding(classState.classRef.name)) {
      path.scope.rename(classState.classRef.name);
    }

    setState({
      userConstructorPath: path,
      userConstructor: method,
      hasConstructor: true,
      bareSupers: replaceSupers.bareSupers,
      superReturns: replaceSupers.returns,
    });

    const { construct } = classState;

    t.inheritsComments(construct, method);

    construct.params = method.params;

    t.inherits(construct.body, method.body);
    construct.body.directives = method.body.directives;

    pushConstructorToBody();
  }

  function pushConstructorToBody() {
    if (classState.pushedConstructor) return;
    classState.pushedConstructor = true;

    // we haven't pushed any descriptors yet
    if (classState.hasInstanceDescriptors || classState.hasStaticDescriptors) {
      pushDescriptors();
    }

    classState.body.push(classState.construct);

    pushInheritsToBody();
  }

  /**
   * Push inherits helper to body.
   */
  function pushInheritsToBody() {
    if (!classState.isDerived || classState.pushedInherits) return;

    setState({ pushedInherits: true });

    // Unshift to ensure that the constructor inheritance is set up before
    // any properties can be assigned to the prototype.
    classState.body.unshift(
      t.expressionStatement(
        t.callExpression(
          classState.file.addHelper(
            classState.isLoose ? "inheritsLoose" : "inherits",
          ),
          [t.cloneNode(classState.classRef), t.cloneNode(classState.superName)],
        ),
      ),
    );
  }

  function setupClosureParamsArgs() {
    const { superName } = classState;
    const closureParams = [];
    const closureArgs = [];

    if (classState.isDerived) {
      const arg = classState.extendsNative
        ? t.callExpression(classState.file.addHelper("wrapNativeSuper"), [
            t.cloneNode(superName),
          ])
        : t.cloneNode(superName);
      const param = classState.scope.generateUidIdentifierBasedOnNode(
        superName,
      );

      closureParams.push(param);
      closureArgs.push(arg);

      setState({ superName: t.cloneNode(param) });
    }

    return { closureParams, closureArgs };
  }

  function classTransformer(
    path: NodePath,
    file,
    builtinClasses: ReadonlySet<string>,
    isLoose: boolean,
  ) {
    setState({
      parent: path.parent,
      scope: path.scope,
      node: path.node,
      path,
      file,
      isLoose,
    });

    setState({
      classId: classState.node.id,
      // this is the name of the binding that will **always** reference the class we've constructed
      classRef: classState.node.id
        ? t.identifier(classState.node.id.name)
        : classState.scope.generateUidIdentifier("class"),
      superName: classState.node.superClass,
      isDerived: !!classState.node.superClass,
      constructorBody: t.blockStatement([]),
    });

    setState({
      extendsNative:
        classState.isDerived &&
        builtinClasses.has(classState.superName.name) &&
        !classState.scope.hasBinding(
          classState.superName.name,
          /* noGlobals */ true,
        ),
    });

    const { classRef, node, constructorBody } = classState;

    setState({
      construct: buildConstructor(classRef, constructorBody, node),
    });

    let { body } = classState;
    const { closureParams, closureArgs } = setupClosureParamsArgs();

    buildBody();

    // make sure this class isn't directly called (with A() instead new A())
    if (!classState.isLoose) {
      constructorBody.body.unshift(
        t.expressionStatement(
          t.callExpression(classState.file.addHelper("classCallCheck"), [
            t.thisExpression(),
            t.cloneNode(classState.classRef),
          ]),
        ),
      );
    }

    body = body.concat(
      classState.staticPropBody.map(fn => fn(t.cloneNode(classState.classRef))),
    );

    const isStrict = path.isInStrictMode();
    let constructorOnly = classState.classId && body.length === 1;
    if (constructorOnly && !isStrict) {
      for (const param of classState.construct.params) {
        // It's illegal to put a use strict directive into the body of a function
        // with non-simple parameters for some reason. So, we have to use a strict
        // wrapper function.
        if (!t.isIdentifier(param)) {
          constructorOnly = false;
          break;
        }
      }
    }

    const directives = constructorOnly ? body[0].body.directives : [];
    if (!isStrict) {
      directives.push(t.directive(t.directiveLiteral("use strict")));
    }

    if (constructorOnly) {
      // named class with only a constructor
      return t.toExpression(body[0]);
    }

    body.push(t.returnStatement(t.cloneNode(classState.classRef)));
    const container = t.arrowFunctionExpression(
      closureParams,
      t.blockStatement(body, directives),
    );
    return t.callExpression(container, closureArgs);
  }

  return classTransformer(path, file, builtinClasses, isLoose);
}
