import type { NodePath } from "@babel/traverse";
import ReplaceSupers from "@babel/helper-replace-supers";
import optimiseCall from "@babel/helper-optimise-call-expression";
import * as defineMap from "@babel/helper-define-map";
import { traverse, template, types as t } from "@babel/core";

type ReadonlySet<T> = Set<T> | { has(val: T): boolean };

const noMethodVisitor = {
  "FunctionExpression|FunctionDeclaration"(path) {
    path.skip();
  },

  Method(path) {
    path.skip();
  },
};

const verifyConstructorVisitor = traverse.visitors.merge([
  noMethodVisitor,
  {
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
      if (this.isDerived) {
        if (path.parentPath.isMemberExpression({ object: path.node })) {
          // In cases like this.foo or this[foo], there is no need to add
          // assertThisInitialized, since they already throw if this is
          // undefined.
          return;
        }

        const assertion = t.callExpression(
          this.file.addHelper("assertThisInitialized"),
          [path.node],
        );
        path.replaceWith(assertion);
        path.skip();
      }
    },
  },
]);

const findThisesVisitor = traverse.visitors.merge([
  noMethodVisitor,
  {
    ThisExpression(path) {
      this.superThises.push(path);
    },
  },
]);

export default class ClassTransformer {
  constructor(path: NodePath, file, builtinClasses: ReadonlySet<string>) {
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

    const { name } = this.superName;
    this.extendsNative =
      this.isDerived &&
      builtinClasses.has(name) &&
      !this.scope.hasBinding(name, /* noGlobals */ true);
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
      if (this.extendsNative) {
        closureArgs.push(
          t.callExpression(this.file.addHelper("wrapNativeSuper"), [
            t.cloneNode(superName),
          ]),
        );
      } else {
        closureArgs.push(t.cloneNode(superName));
      }

      superName = this.scope.generateUidIdentifierBasedOnNode(superName);
      closureParams.push(superName);

      this.superName = t.cloneNode(superName);
    }

    //
    this.buildBody();

    // make sure this class isn't directly called (with A() instead new A())
    if (!this.isLoose) {
      constructorBody.body.unshift(
        t.expressionStatement(
          t.callExpression(file.addHelper("classCallCheck"), [
            t.thisExpression(),
            t.cloneNode(this.classRef),
          ]),
        ),
      );
    }

    body = body.concat(
      this.staticPropBody.map(fn => fn(t.cloneNode(this.classRef))),
    );

    if (this.classId) {
      // named class with only a constructor
      if (body.length === 1) return t.toExpression(body[0]);
    }

    //
    body.push(t.returnStatement(t.cloneNode(this.classRef)));

    const container = t.arrowFunctionExpression(
      closureParams,
      t.blockStatement(body),
    );
    return t.callExpression(container, closureArgs);
  }

  buildConstructor() {
    const func = t.functionDeclaration(
      t.cloneNode(this.classRef),
      [],
      this.constructorBody,
    );
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
        }

        const replaceSupers = new ReplaceSupers(
          {
            forceSuperMemoisation: isConstructor,
            methodPath: path,
            methodNode: node,
            objectRef: this.classRef,
            superRef: this.superName,
            inConstructor: isConstructor,
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

      let args = [
        t.cloneNode(this.classRef), // Constructor
        t.nullLiteral(), // instanceDescriptors
        t.nullLiteral(), // staticDescriptors
        t.nullLiteral(), // instanceInitializers
        t.nullLiteral(), // staticInitializers
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
        if (!t.isNullLiteral(args[i])) lastNonNullIndex = i;
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
          t.cloneNode(superRef),
          t.identifier("apply"),
        );
      } else {
        bareSuperNode.callee = t.memberExpression(
          t.cloneNode(superRef),
          t.identifier("call"),
        );
      }
    } else {
      bareSuperNode = optimiseCall(
        t.logicalExpression(
          "||",
          t.memberExpression(
            t.cloneNode(this.classRef),
            t.identifier("__proto__"),
          ),
          t.callExpression(
            t.memberExpression(
              t.identifier("Object"),
              t.identifier("getPrototypeOf"),
            ),
            [t.cloneNode(this.classRef)],
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

    if (
      bareSuper.parentPath.isExpressionStatement() &&
      bareSuper.parentPath.container === body.node.body &&
      body.node.body.length - 1 === bareSuper.parentPath.key
    ) {
      // this super call is the last statement in the body so we can just straight up
      // turn it into a return

      if (this.superThises.length) {
        call = t.assignmentExpression("=", thisRef(), call);
      }

      bareSuper.parentPath.replaceWith(t.returnStatement(call));
    } else {
      bareSuper.replaceWith(t.assignmentExpression("=", thisRef(), call));
    }
  }

  verifyConstructor() {
    if (!this.isDerived) return;

    const path = this.userConstructorPath;
    const body = path.get("body");

    path.traverse(findThisesVisitor, this);

    let guaranteedSuperBeforeFinish = !!this.bareSupers.length;

    const superRef = this.superName || t.identifier("Function");
    let thisRef = function() {
      const ref = path.scope.generateDeclaredUidIdentifier("this");
      thisRef = () => t.cloneNode(ref);
      return ref;
    };

    for (const bareSuper of this.bareSupers) {
      this.wrapSuperCall(bareSuper, superRef, thisRef, body);

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

    for (const thisPath of this.superThises) {
      thisPath.replaceWith(thisRef());
    }

    let wrapReturn;

    if (this.isLoose) {
      wrapReturn = returnArg => {
        const thisExpr = t.callExpression(
          this.file.addHelper("assertThisInitialized"),
          [thisRef()],
        );
        return returnArg
          ? t.logicalExpression("||", returnArg, thisExpr)
          : thisExpr;
      };
    } else {
      wrapReturn = returnArg =>
        t.callExpression(
          this.file.addHelper("possibleConstructorReturn"),
          [thisRef()].concat(returnArg || []),
        );
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

    for (const returnPath of this.superReturns) {
      returnPath
        .get("argument")
        .replaceWith(wrapReturn(returnPath.node.argument));
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

    // Check if it is a static get or set
    if (node.static && (node.kind === "get" || node.kind === "set")) {
      if (this._processSetGet(node, path)) return;
    }

    this.pushToMap(node, false, null, scope);
  }

  _processSetGet() {
    return false;
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
          [t.cloneNode(this.classRef), t.cloneNode(this.superName)],
        ),
      ),
    );
  }
}
