import type { NodePath } from "babel-traverse";
import { visitors } from "babel-traverse";
import ReplaceSupers from "babel-helper-replace-supers";
import optimiseCall from "babel-helper-optimise-call-expression";
import * as defineMap from "babel-helper-define-map";
import template from "babel-template";
import * as t from "babel-types";

const buildDerivedConstructor = template(`
  (function () {
    super(...arguments);
  })
`);

const noMethodVisitor = {
  "FunctionExpression|FunctionDeclaration"(path) {
    path.skip();
  },

  Method(path) {
    path.skip();
  },
};

const verifyConstructorVisitor = visitors.merge([
  noMethodVisitor,
  {
    MemberExpression: {
      exit(path) {
        const objectPath = path.get("object");
        if (this.isDerived && !this.hasBareSuper && objectPath.isSuper()) {
          const hasArrowFunctionParent = path.findParent(p =>
            p.isArrowFunctionExpression(),
          );
          if (!hasArrowFunctionParent) {
            throw objectPath.buildCodeFrameError(
              "'super.*' is not allowed before super()",
            );
          }
        }
      },
    },

    CallExpression: {
      exit(path) {
        if (path.get("callee").isSuper()) {
          this.hasBareSuper = true;

          if (!this.isDerived) {
            throw path.buildCodeFrameError(
              "super() is only allowed in a derived constructor",
            );
          }
        }
      },
    },

    ThisExpression(path) {
      if (this.isDerived && !this.hasBareSuper) {
        const fn = path.find(p => p.isFunction());

        if (!fn || !fn.isArrowFunctionExpression()) {
          throw path.buildCodeFrameError(
            "'this' is not allowed before super()",
          );
        }
      }
    },
  },
]);

const findThisesVisitor = visitors.merge([
  noMethodVisitor,
  {
    ThisExpression(path) {
      this.superThises.push(path);
    },
  },
]);

export default class ClassTransformer {
  constructor(path: NodePath, file) {
    this.parent = path.parent;
    this.scope = path.scope;
    this.node = path.node;
    this.path = path;
    this.file = file;

    this.clearDescriptors();

    this.instancePropBody = [];
    this.instancePropRefs = {};
    this.staticPropBody = [];
    this.body = [];

    this.bareSuperAfter = [];
    this.bareSupers = [];

    this.pushedConstructor = false;
    this.pushedInherits = false;
    this.isLoose = false;

    this.superThises = [];

    // class id
    this.classId = this.node.id;

    // this is the name of the binding that will **always** reference the class we've constructed
    this.classRef = this.node.id
      ? t.identifier(this.node.id.name)
      : this.scope.generateUidIdentifier("class");

    this.superName = this.node.superClass || t.identifier("Function");
    this.isDerived = !!this.node.superClass;
  }

  run() {
    let superName = this.superName;
    const file = this.file;
    let body = this.body;

    //

    const constructorBody = (this.constructorBody = t.blockStatement([]));
    this.constructor = this.buildConstructor();

    //

    const closureParams = [];
    const closureArgs = [];

    //
    if (this.isDerived) {
      closureArgs.push(superName);

      superName = this.scope.generateUidIdentifierBasedOnNode(superName);
      closureParams.push(superName);

      this.superName = superName;
    }

    //
    this.buildBody();

    // make sure this class isn't directly called (with A() instead new A())
    if (!this.isLoose) {
      constructorBody.body.unshift(
        t.expressionStatement(
          t.callExpression(file.addHelper("classCallCheck"), [
            t.thisExpression(),
            this.classRef,
          ]),
        ),
      );
    }

    body = body.concat(this.staticPropBody.map(fn => fn(this.classRef)));

    if (this.classId) {
      // named class with only a constructor
      if (body.length === 1) return t.toExpression(body[0]);
    }

    //
    body.push(t.returnStatement(this.classRef));

    const container = t.arrowFunctionExpression(
      closureParams,
      t.blockStatement(body),
    );
    return t.callExpression(container, closureArgs);
  }

  buildConstructor() {
    const func = t.functionDeclaration(this.classRef, [], this.constructorBody);
    t.inherits(func, this.node);
    return func;
  }

  pushToMap(node, enumerable, kind = "value", scope?) {
    let mutatorMap;
    if (node.static) {
      this.hasStaticDescriptors = true;
      mutatorMap = this.staticMutatorMap;
    } else {
      this.hasInstanceDescriptors = true;
      mutatorMap = this.instanceMutatorMap;
    }

    const map = defineMap.push(mutatorMap, node, kind, this.file, scope);

    if (enumerable) {
      map.enumerable = t.booleanLiteral(true);
    }

    return map;
  }

  /**
   * [Please add a description.]
   * https://www.youtube.com/watch?v=fWNaR-rxAic
   */

  constructorMeMaybe() {
    let hasConstructor = false;
    const paths = this.path.get("body.body");
    for (const path of (paths: Array)) {
      hasConstructor = path.equals("kind", "constructor");
      if (hasConstructor) break;
    }
    if (hasConstructor) return;

    let params, body;

    if (this.isDerived) {
      const constructor = buildDerivedConstructor().expression;
      params = constructor.params;
      body = constructor.body;
    } else {
      params = [];
      body = t.blockStatement([]);
    }

    this.path
      .get("body")
      .unshiftContainer(
        "body",
        t.classMethod("constructor", t.identifier("constructor"), params, body),
      );
  }

  buildBody() {
    this.constructorMeMaybe();
    this.pushBody();
    this.verifyConstructor();

    if (this.userConstructor) {
      const constructorBody = this.constructorBody;
      constructorBody.body = constructorBody.body.concat(
        this.userConstructor.body.body,
      );
      t.inherits(this.constructor, this.userConstructor);
      t.inherits(constructorBody, this.userConstructor.body);
    }

    this.pushDescriptors();
  }

  pushBody() {
    const classBodyPaths: Array<Object> = this.path.get("body.body");

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

        if (isConstructor) {
          path.traverse(verifyConstructorVisitor, this);

          if (!this.hasBareSuper && this.isDerived) {
            throw path.buildCodeFrameError(
              "missing super() call in constructor",
            );
          }
        }

        const replaceSupers = new ReplaceSupers(
          {
            forceSuperMemoisation: isConstructor,
            methodPath: path,
            methodNode: node,
            objectRef: this.classRef,
            superRef: this.superName,
            isStatic: node.static,
            isLoose: this.isLoose,
            scope: this.scope,
            file: this.file,
          },
          true,
        );

        replaceSupers.replace();

        if (isConstructor) {
          this.pushConstructor(replaceSupers, node, path);
        } else {
          this.pushMethod(node, path);
        }
      }
    }
  }

  clearDescriptors() {
    this.hasInstanceDescriptors = false;
    this.hasStaticDescriptors = false;

    this.instanceMutatorMap = {};
    this.staticMutatorMap = {};
  }

  pushDescriptors() {
    this.pushInherits();

    const body = this.body;

    let instanceProps;
    let staticProps;

    if (this.hasInstanceDescriptors) {
      instanceProps = defineMap.toClassObject(this.instanceMutatorMap);
    }

    if (this.hasStaticDescriptors) {
      staticProps = defineMap.toClassObject(this.staticMutatorMap);
    }

    if (instanceProps || staticProps) {
      if (instanceProps) {
        instanceProps = defineMap.toComputedObjectFromClass(instanceProps);
      }
      if (staticProps) {
        staticProps = defineMap.toComputedObjectFromClass(staticProps);
      }

      const nullNode = t.nullLiteral();

      let args = [
        this.classRef, // Constructor
        nullNode, // instanceDescriptors
        nullNode, // staticDescriptors
        nullNode, // instanceInitializers
        nullNode, // staticInitializers
      ];

      if (instanceProps) args[1] = instanceProps;
      if (staticProps) args[2] = staticProps;

      if (this.instanceInitializersId) {
        args[3] = this.instanceInitializersId;
        body.unshift(this.buildObjectAssignment(this.instanceInitializersId));
      }

      if (this.staticInitializersId) {
        args[4] = this.staticInitializersId;
        body.unshift(this.buildObjectAssignment(this.staticInitializersId));
      }

      let lastNonNullIndex = 0;
      for (let i = 0; i < args.length; i++) {
        if (args[i] !== nullNode) lastNonNullIndex = i;
      }
      args = args.slice(0, lastNonNullIndex + 1);

      body.push(
        t.expressionStatement(
          t.callExpression(this.file.addHelper("createClass"), args),
        ),
      );
    }

    this.clearDescriptors();
  }

  buildObjectAssignment(id) {
    return t.variableDeclaration("var", [
      t.variableDeclarator(id, t.objectExpression([])),
    ]);
  }

  wrapSuperCall(bareSuper, superRef, thisRef, body) {
    let bareSuperNode = bareSuper.node;

    if (this.isLoose) {
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
          superRef,
          t.identifier("apply"),
        );
      } else {
        bareSuperNode.callee = t.memberExpression(
          superRef,
          t.identifier("call"),
        );
      }
    } else {
      bareSuperNode = optimiseCall(
        t.logicalExpression(
          "||",
          t.memberExpression(this.classRef, t.identifier("__proto__")),
          t.callExpression(
            t.memberExpression(
              t.identifier("Object"),
              t.identifier("getPrototypeOf"),
            ),
            [this.classRef],
          ),
        ),
        t.thisExpression(),
        bareSuperNode.arguments,
      );
    }

    let call;

    if (this.isLoose) {
      call = t.logicalExpression("||", bareSuperNode, t.thisExpression());
    } else {
      call = t.callExpression(
        this.file.addHelper("possibleConstructorReturn"),
        [t.thisExpression(), bareSuperNode],
      );
    }

    const bareSuperAfter = this.bareSuperAfter.map(fn => fn(thisRef));

    if (
      bareSuper.parentPath.isExpressionStatement() &&
      bareSuper.parentPath.container === body.node.body &&
      body.node.body.length - 1 === bareSuper.parentPath.key
    ) {
      // this super call is the last statement in the body so we can just straight up
      // turn it into a return

      if (this.superThises.length || bareSuperAfter.length) {
        bareSuper.scope.push({ id: thisRef });
        call = t.assignmentExpression("=", thisRef, call);
      }

      if (bareSuperAfter.length) {
        call = t.toSequenceExpression([call, ...bareSuperAfter, thisRef]);
      }

      bareSuper.parentPath.replaceWith(t.returnStatement(call));
    } else {
      bareSuper.replaceWithMultiple([
        t.variableDeclaration("var", [t.variableDeclarator(thisRef, call)]),
        ...bareSuperAfter,
        t.expressionStatement(thisRef),
      ]);
    }
  }

  verifyConstructor() {
    if (!this.isDerived) return;

    const path = this.userConstructorPath;
    const body = path.get("body");

    path.traverse(findThisesVisitor, this);

    let guaranteedSuperBeforeFinish = !!this.bareSupers.length;

    const superRef = this.superName || t.identifier("Function");
    const thisRef = path.scope.generateUidIdentifier("this");

    for (const bareSuper of this.bareSupers) {
      this.wrapSuperCall(bareSuper, superRef, thisRef, body);

      if (guaranteedSuperBeforeFinish) {
        bareSuper.find(function(parentPath) {
          // hit top so short circuit
          if (parentPath === path) {
            return true;
          }

          if (parentPath.isLoop() || parentPath.isConditional()) {
            guaranteedSuperBeforeFinish = false;
            return true;
          }
        });
      }
    }

    for (const thisPath of this.superThises) {
      thisPath.replaceWith(thisRef);
    }

    let wrapReturn;

    if (this.isLoose) {
      wrapReturn = returnArg => {
        return returnArg
          ? t.logicalExpression("||", returnArg, thisRef)
          : thisRef;
      };
    } else {
      wrapReturn = returnArg =>
        t.callExpression(
          this.file.addHelper("possibleConstructorReturn"),
          [thisRef].concat(returnArg || []),
        );
    }

    // if we have a return as the last node in the body then we've already caught that
    // return
    const bodyPaths = body.get("body");
    if (bodyPaths.length && !bodyPaths.pop().isReturnStatement()) {
      body.pushContainer(
        "body",
        t.returnStatement(guaranteedSuperBeforeFinish ? thisRef : wrapReturn()),
      );
    }

    for (const returnPath of this.superReturns) {
      if (returnPath.node.argument) {
        const ref = returnPath.scope.generateDeclaredUidIdentifier("ret");
        returnPath
          .get("argument")
          .replaceWithMultiple([
            t.assignmentExpression("=", ref, returnPath.node.argument),
            wrapReturn(ref),
          ]);
      } else {
        returnPath.get("argument").replaceWith(wrapReturn());
      }
    }
  }

  /**
   * Push a method to its respective mutatorMap.
   */

  pushMethod(node: { type: "ClassMethod" }, path?: NodePath) {
    const scope = path ? path.scope : this.scope;

    if (node.kind === "method") {
      if (this._processMethod(node, scope)) return;
    }

    this.pushToMap(node, false, null, scope);
  }

  _processMethod() {
    return false;
  }

  /**
   * Replace the constructor body of our class.
   */

  pushConstructor(
    replaceSupers,
    method: { type: "ClassMethod" },
    path: NodePath,
  ) {
    this.bareSupers = replaceSupers.bareSupers;
    this.superReturns = replaceSupers.returns;

    // https://github.com/babel/babel/issues/1077
    if (path.scope.hasOwnBinding(this.classRef.name)) {
      path.scope.rename(this.classRef.name);
    }

    const construct = this.constructor;

    this.userConstructorPath = path;
    this.userConstructor = method;
    this.hasConstructor = true;

    t.inheritsComments(construct, method);

    construct._ignoreUserWhitespace = true;
    construct.params = method.params;

    t.inherits(construct.body, method.body);
    construct.body.directives = method.body.directives;

    // push constructor to body
    this._pushConstructor();
  }

  _pushConstructor() {
    if (this.pushedConstructor) return;
    this.pushedConstructor = true;

    // we haven't pushed any descriptors yet
    if (this.hasInstanceDescriptors || this.hasStaticDescriptors) {
      this.pushDescriptors();
    }

    this.body.push(this.constructor);

    this.pushInherits();
  }

  /**
   * Push inherits helper to body.
   */

  pushInherits() {
    if (!this.isDerived || this.pushedInherits) return;

    // Unshift to ensure that the constructor inheritance is set up before
    // any properties can be assigned to the prototype.
    this.pushedInherits = true;
    this.body.unshift(
      t.expressionStatement(
        t.callExpression(
          this.isLoose
            ? this.file.addHelper("inheritsLoose")
            : this.file.addHelper("inherits"),
          [this.classRef, this.superName],
        ),
      ),
    );
  }
}
