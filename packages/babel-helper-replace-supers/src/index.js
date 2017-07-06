import type { NodePath, Scope } from "babel-traverse";
import optimiseCall from "babel-helper-optimise-call-expression";
import * as messages from "babel-messages";
import * as t from "babel-types";

// ✌️
const HARDCORE_THIS_REF = Symbol();

function isIllegalBareSuper(node, parent) {
  if (!t.isSuper(node)) return false;
  if (t.isMemberExpression(parent, { computed: false })) return false;
  if (t.isCallExpression(parent, { callee: node })) return false;
  return true;
}

function isMemberExpressionSuper(node) {
  return t.isMemberExpression(node) && t.isSuper(node.object);
}

/**
 * Creates an expression which result is the proto of objectRef.
 * Uses CLASS.__proto__ first for InternetExplorer <= 10 support
 *
 * @example <caption>isStatic === true</caption>
 *
 *   CLASS.__proto__ || Object.getPrototypeOf(CLASS)
 *
 * @example <caption>isStatic === false</caption>
 *
 *   CLASS.prototype.__proto__ || Object.getPrototypeOf(CLASS.prototype)
 */
function getPrototypeOfExpression(objectRef, isStatic) {
  const targetRef = isStatic
    ? objectRef
    : t.memberExpression(objectRef, t.identifier("prototype"));

  return t.logicalExpression(
    "||",
    t.memberExpression(targetRef, t.identifier("__proto__")),
    t.callExpression(
      t.memberExpression(
        t.identifier("Object"),
        t.identifier("getPrototypeOf"),
      ),
      [targetRef],
    ),
  );
}

const visitor = {
  Function(path) {
    if (!path.isArrowFunctionExpression()) path.skip();
  },

  ReturnStatement(path, state) {
    state.returns.push(path);
  },

  ThisExpression(path, state) {
    if (!path.node[HARDCORE_THIS_REF]) {
      state.thises.push(path);
    }
  },

  enter(path, state) {
    let callback = state.specHandle;
    if (state.isLoose) callback = state.looseHandle;

    const isBareSuper = path.isCallExpression() && path.get("callee").isSuper();

    const result = callback.call(state, path);

    if (result) {
      state.hasSuper = true;
    }

    if (isBareSuper) {
      state.bareSupers.push(path);
    }

    if (result === true) {
      path.requeue();
    }

    if (result !== true && result) {
      if (Array.isArray(result)) {
        path.replaceWithMultiple(result);
      } else {
        path.replaceWith(result);
      }
    }
  },
};

export default class ReplaceSupers {
  constructor(opts: Object, inClass?: boolean = false) {
    this.forceSuperMemoisation = opts.forceSuperMemoisation;
    this.methodPath = opts.methodPath;
    this.methodNode = opts.methodNode;
    this.superRef = opts.superRef;
    this.isStatic = opts.isStatic;
    this.hasSuper = false;
    this.inClass = inClass;
    this.isLoose = opts.isLoose;
    this.scope = this.methodPath.scope;
    this.file = opts.file;
    this.opts = opts;

    this.bareSupers = [];
    this.returns = [];
    this.thises = [];
  }

  forceSuperMemoisation: boolean;
  methodPath: NodePath;
  methodNode: Object;
  superRef: Object;
  isStatic: boolean;
  hasSuper: boolean;
  inClass: boolean;
  isLoose: boolean;
  scope: Scope;
  file;
  opts: {
    forceSuperMemoisation: boolean,
    getObjetRef: Function,
    methodPath: NodePath,
    methodNode: Object,
    superRef: Object,
    isStatic: boolean,
    isLoose: boolean,
    file: any,
  };

  getObjectRef() {
    return this.opts.objectRef || this.opts.getObjectRef();
  }

  /**
   * Sets a super class value of the named property.
   *
   * @example
   *
   *   _set(CLASS.prototype.__proto__ || Object.getPrototypeOf(CLASS.prototype), "METHOD", "VALUE",
   *     this)
   *
   */

  setSuperProperty(
    property: Object,
    value: Object,
    isComputed: boolean,
  ): Object {
    return t.callExpression(this.file.addHelper("set"), [
      getPrototypeOfExpression(this.getObjectRef(), this.isStatic),
      isComputed ? property : t.stringLiteral(property.name),
      value,
      t.thisExpression(),
    ]);
  }

  /**
   * Gets a node representing the super class value of the named property.
   *
   * @example
   *
   *   _get(CLASS.prototype.__proto__ || Object.getPrototypeOf(CLASS.prototype), "METHOD", this)
   *
   */

  getSuperProperty(property: Object, isComputed: boolean): Object {
    return t.callExpression(this.file.addHelper("get"), [
      getPrototypeOfExpression(this.getObjectRef(), this.isStatic),
      isComputed ? property : t.stringLiteral(property.name),
      t.thisExpression(),
    ]);
  }

  replace() {
    this.methodPath.traverse(visitor, this);
  }

  getLooseSuperProperty(id: Object, parent: Object) {
    const methodNode = this.methodNode;
    const superRef = this.superRef || t.identifier("Function");

    if (parent.property === id) {
      return;
    } else if (t.isCallExpression(parent, { callee: id })) {
      return;
    } else if (t.isMemberExpression(parent) && !methodNode.static) {
      // super.test -> objectRef.prototype.test
      return t.memberExpression(superRef, t.identifier("prototype"));
    } else {
      return superRef;
    }
  }

  looseHandle(path: NodePath) {
    const node = path.node;
    if (path.isSuper()) {
      return this.getLooseSuperProperty(node, path.parent);
    } else if (path.isCallExpression()) {
      const callee = node.callee;
      if (!t.isMemberExpression(callee)) return;
      if (!t.isSuper(callee.object)) return;

      // super.test(); -> objectRef.prototype.MethodName.call(this);
      t.appendToMemberExpression(callee, t.identifier("call"));
      node.arguments.unshift(t.thisExpression());
      return true;
    }
  }

  specHandleAssignmentExpression(ref, path, node) {
    if (node.operator === "=") {
      // super.name = "val"; -> _set(Object.getPrototypeOf(objectRef.prototype), "name", this);
      return this.setSuperProperty(
        node.left.property,
        node.right,
        node.left.computed,
      );
    } else {
      // super.age += 2; -> let _ref = super.age; super.age = _ref + 2;
      ref = ref || path.scope.generateUidIdentifier("ref");
      return [
        t.variableDeclaration("var", [t.variableDeclarator(ref, node.left)]),
        t.expressionStatement(
          t.assignmentExpression(
            "=",
            node.left,
            t.binaryExpression(node.operator.slice(0, -1), ref, node.right),
          ),
        ),
      ];
    }
  }

  specHandle(path: NodePath) {
    let property;
    let computed;
    let args;

    const parent = path.parent;
    const node = path.node;

    if (isIllegalBareSuper(node, parent)) {
      throw path.buildCodeFrameError(messages.get("classesIllegalBareSuper"));
    }

    if (t.isCallExpression(node)) {
      const callee = node.callee;
      if (t.isSuper(callee)) {
        return;
      } else if (isMemberExpressionSuper(callee)) {
        // super.test();
        // to
        // _get(Object.getPrototypeOf(objectRef.prototype), "test", this).call(this);
        property = callee.property;
        computed = callee.computed;
        args = node.arguments;
      }
    } else if (t.isMemberExpression(node) && t.isSuper(node.object)) {
      // super.name;
      // to
      // _get(Object.getPrototypeOf(objectRef.prototype), "name", this);
      property = node.property;
      computed = node.computed;
    } else if (
      t.isUpdateExpression(node) &&
      isMemberExpressionSuper(node.argument)
    ) {
      const binary = t.assignmentExpression(
        node.operator[0] + "=",
        node.argument,
        t.numericLiteral(1),
      );
      if (node.prefix) {
        // ++super.foo;
        // to
        // super.foo += 1;
        return this.specHandleAssignmentExpression(null, path, binary);
      } else {
        // super.foo++;
        // to
        // let _ref = super.foo; super.foo = _ref + 1;
        const ref = path.scope.generateUidIdentifier("ref");
        return this.specHandleAssignmentExpression(ref, path, binary).concat(
          t.expressionStatement(ref),
        );
      }
    } else if (
      t.isAssignmentExpression(node) &&
      isMemberExpressionSuper(node.left)
    ) {
      return this.specHandleAssignmentExpression(null, path, node);
    }

    if (!property) return;

    const superProperty = this.getSuperProperty(property, computed);

    if (args) {
      return this.optimiseCall(superProperty, args);
    } else {
      return superProperty;
    }
  }

  optimiseCall(callee, args) {
    const thisNode = t.thisExpression();
    thisNode[HARDCORE_THIS_REF] = true;
    return optimiseCall(callee, thisNode, args);
  }
}
