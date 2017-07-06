// This file contains methods that convert the path node into another node or some other type of data.

import * as t from "babel-types";
import nameFunction from "babel-helper-function-name";

export function toComputedKey(): Object {
  const node = this.node;

  let key;
  if (this.isMemberExpression()) {
    key = node.property;
  } else if (this.isProperty() || this.isMethod()) {
    key = node.key;
  } else {
    throw new ReferenceError("todo");
  }

  if (!node.computed) {
    if (t.isIdentifier(key)) key = t.stringLiteral(key.name);
  }

  return key;
}

export function ensureBlock() {
  return t.ensureBlock(this.node);
}

/**
 * Keeping this for backward-compatibility. You should use arrowFunctionToExpression() for >=7.x.
 */
export function arrowFunctionToShadowed() {
  if (!this.isArrowFunctionExpression()) return;

  this.arrowFunctionToExpression();
}

/**
 * Given an arbitrary function, process its content as if it were an arrow function, moving references
 * to "this", "arguments", "super", and such into the function's parent scope. This method is useful if
 * you have wrapped some set of items in an IIFE or other function, but want "this", "arguments", and super"
 * to continue behaving as expected.
 */
export function unwrapFunctionEnvironment() {
  if (
    !this.isArrowFunctionExpression() &&
    !this.isFunctionExpression() &&
    !this.isFunctionDeclaration()
  ) {
    throw this.buildCodeFrameError(
      "Can only unwrap the environment of a function.",
    );
  }

  hoistFunctionEnvironment(this);
}

/**
 * Convert a given arrow function into a normal ES5 function expression.
 */
export function arrowFunctionToExpression(
  { allowInsertArrow = true, specCompliant = false } = {},
) {
  if (!this.isArrowFunctionExpression()) {
    throw this.buildCodeFrameError(
      "Cannot convert non-arrow function to a function expression.",
    );
  }

  const thisBinding = hoistFunctionEnvironment(
    this,
    specCompliant,
    allowInsertArrow,
  );

  this.ensureBlock();
  this.node.type = "FunctionExpression";
  if (specCompliant) {
    const checkBinding = thisBinding
      ? null
      : this.parentPath.scope.generateUidIdentifier("arrowCheckId");
    if (checkBinding) {
      this.parentPath.scope.push({
        id: checkBinding,
        init: t.objectExpression([]),
      });
    }

    this.get("body").unshiftContainer(
      "body",
      t.expressionStatement(
        t.callExpression(this.hub.file.addHelper("newArrowCheck"), [
          t.thisExpression(),
          checkBinding
            ? t.identifier(checkBinding.name)
            : t.identifier(thisBinding),
        ]),
      ),
    );

    this.replaceWith(
      t.callExpression(
        t.memberExpression(
          nameFunction(this) || this.node,
          t.identifier("bind"),
        ),
        [checkBinding ? t.identifier(checkBinding.name) : t.thisExpression()],
      ),
    );
  }
}

/**
 * Given a function, traverse its contents, and if there are references to "this", "arguments", "super",
 * or "new.target", ensure that these references reference the parent environment around this function.
 */
function hoistFunctionEnvironment(
  fnPath,
  specCompliant = false,
  allowInsertArrow = true,
) {
  const thisEnvFn = fnPath.findParent(
    p =>
      (p.isFunction() && !p.isArrowFunctionExpression()) ||
      p.isProgram() ||
      p.isClassProperty(),
  );
  const inConstructor = thisEnvFn && thisEnvFn.node.kind === "constructor";

  if (thisEnvFn.isClassProperty()) {
    throw fnPath.buildCodeFrameError(
      "Unable to transform arrow inside class property",
    );
  }

  const {
    thisPaths,
    argumentsPaths,
    newTargetPaths,
    superProps,
    superCalls,
  } = getScopeInformation(fnPath);

  // Convert all super() calls in the constructor, if super is used in an arrow.
  if (inConstructor && superCalls.length > 0) {
    if (!allowInsertArrow) {
      throw superCalls[0].buildCodeFrameError(
        "Unable to handle nested super() usage in arrow",
      );
    }

    const allSuperCalls = [];
    thisEnvFn.traverse({
      Function: child => {
        if (
          child.isArrowFunctionExpression() ||
          child.isClassProperty() ||
          child === fnPath
        ) {
          return;
        }
        child.skip();
      },
      CallExpression(child) {
        if (!child.get("callee").isSuper()) return;

        allSuperCalls.push(child);
      },
    });

    const superBinding = getSuperBinding(thisEnvFn);

    allSuperCalls.forEach(superCall =>
      superCall.get("callee").replaceWith(t.identifier(superBinding)),
    );
  }

  // Convert all "this" references in the arrow to point at the alias.
  let thisBinding;
  if (thisPaths.length > 0 || specCompliant) {
    thisBinding = getThisBinding(thisEnvFn, inConstructor);

    if (
      !specCompliant ||
      // In subclass constructors, still need to rewrite because "this" can't be bound in spec mode
      // because it might not have been initialized yet.
      (inConstructor && hasSuperClass(thisEnvFn))
    ) {
      thisPaths.forEach(thisChild => {
        thisChild.replaceWith(
          thisChild.isJSX()
            ? t.jSXIdentifier(thisBinding)
            : t.identifier(thisBinding),
        );
      });

      if (specCompliant) thisBinding = null;
    }
  }

  // Convert all "arguments" references in the arrow to point at the alias.
  if (argumentsPaths.length > 0) {
    const argumentsBinding = getBinding(thisEnvFn, "arguments", () =>
      t.identifier("arguments"),
    );

    argumentsPaths.forEach(argumentsChild => {
      argumentsChild.replaceWith(t.identifier(argumentsBinding));
    });
  }

  // Convert all "new.target" references in the arrow to point at the alias.
  if (newTargetPaths.length > 0) {
    const newTargetBinding = getBinding(thisEnvFn, "newtarget", () =>
      t.metaProperty(t.identifier("new"), t.identifier("target")),
    );

    newTargetPaths.forEach(argumentsChild => {
      argumentsChild.replaceWith(t.identifier(newTargetBinding));
    });
  }

  // Convert all "super.prop" references to point at aliases.
  if (superProps.length > 0) {
    if (!allowInsertArrow) {
      throw superProps[0].buildCodeFrameError(
        "Unable to handle nested super.prop usage",
      );
    }

    const flatSuperProps = superProps.reduce(
      (acc, superProp) => acc.concat(standardizeSuperProperty(superProp)),
      [],
    );

    flatSuperProps.forEach(superProp => {
      const key = superProp.node.computed
        ? ""
        : superProp.get("property").node.name;

      if (superProp.parentPath.isCallExpression({ callee: superProp.node })) {
        const superBinding = getSuperPropCallBinding(thisEnvFn, key);

        if (superProp.node.computed) {
          const prop = superProp.get("property").node;
          superProp.replaceWith(t.identifier(superBinding));
          superProp.parentPath.node.arguments.unshift(prop);
        } else {
          superProp.replaceWith(t.identifier(superBinding));
        }
      } else {
        const isAssignment = superProp.parentPath.isAssignmentExpression({
          left: superProp.node,
        });
        const superBinding = getSuperPropBinding(thisEnvFn, isAssignment, key);

        const args = [];
        if (superProp.node.computed) {
          args.push(superProp.get("property").node);
        }

        if (isAssignment) {
          const value = superProp.parentPath.node.right;
          args.push(value);
          superProp.parentPath.replaceWith(
            t.callExpression(t.identifier(superBinding), args),
          );
        } else {
          superProp.replaceWith(
            t.callExpression(t.identifier(superBinding), args),
          );
        }
      }
    });
  }

  return thisBinding;
}

function standardizeSuperProperty(superProp) {
  if (
    superProp.parentPath.isAssignmentExpression() &&
    superProp.parentPath.node.operator !== "="
  ) {
    const assignmentPath = superProp.parentPath;

    const op = assignmentPath.node.operator.slice(0, -1);
    const value = assignmentPath.node.right;

    assignmentPath.node.operator = "=";
    if (superProp.node.computed) {
      const tmp = superProp.scope.generateDeclaredUidIdentifier("tmp");

      assignmentPath
        .get("left")
        .replaceWith(
          t.memberExpression(
            superProp.node.object,
            t.assignmentExpression("=", tmp, superProp.node.property),
            true /* computed */,
          ),
        );

      assignmentPath
        .get("right")
        .replaceWith(
          t.binaryExpression(
            op,
            t.memberExpression(
              superProp.node.object,
              t.identifier(tmp.name),
              true /* computed */,
            ),
            value,
          ),
        );
    } else {
      assignmentPath
        .get("left")
        .replaceWith(
          t.memberExpression(superProp.node.object, superProp.node.property),
        );

      assignmentPath
        .get("right")
        .replaceWith(
          t.binaryExpression(
            op,
            t.memberExpression(
              superProp.node.object,
              t.identifier(superProp.node.property.name),
            ),
            value,
          ),
        );
    }
    return [
      assignmentPath.get("left"),
      assignmentPath.get("right").get("left"),
    ];
  } else if (superProp.parentPath.isUpdateExpression()) {
    const updateExpr = superProp.parentPath;

    const tmp = superProp.scope.generateDeclaredUidIdentifier("tmp");
    const computedKey = superProp.node.computed
      ? superProp.scope.generateDeclaredUidIdentifier("prop")
      : null;

    const parts = [
      t.assignmentExpression(
        "=",
        tmp,
        t.memberExpression(
          superProp.node.object,
          computedKey
            ? t.assignmentExpression("=", computedKey, superProp.node.property)
            : superProp.node.property,
          superProp.node.computed,
        ),
      ),
      t.assignmentExpression(
        "=",
        t.memberExpression(
          superProp.node.object,
          computedKey
            ? t.identifier(computedKey.name)
            : superProp.node.property,
          superProp.node.computed,
        ),
        t.binaryExpression("+", t.identifier(tmp.name), t.numericLiteral(1)),
      ),
    ];

    if (!superProp.parentPath.node.prefix) {
      parts.push(t.identifier(tmp.name));
    }

    updateExpr.replaceWith(t.sequenceExpression(parts));

    const left = updateExpr.get("expressions.0.right");
    const right = updateExpr.get("expressions.1.left");
    return [left, right];
  }

  return [superProp];
}

function hasSuperClass(thisEnvFn) {
  return (
    thisEnvFn.isClassMethod() &&
    !!thisEnvFn.parentPath.parentPath.node.superClass
  );
}

// Create a binding that evaluates to the "this" of the given function.
function getThisBinding(thisEnvFn, inConstructor) {
  return getBinding(thisEnvFn, "this", thisBinding => {
    if (!inConstructor || !hasSuperClass(thisEnvFn)) return t.thisExpression();

    const supers = new WeakSet();
    thisEnvFn.traverse({
      Function: child => {
        if (
          child.isArrowFunctionExpression() ||
          child.isClassProperty() ||
          child === this
        ) {
          return;
        }

        child.skip();
      },
      CallExpression(child) {
        if (!child.get("callee").isSuper()) return;
        if (supers.has(child.node)) return;
        supers.add(child.node);

        child.replaceWith(
          t.assignmentExpression("=", t.identifier(thisBinding), child.node),
        );
      },
    });
  });
}

// Create a binding for a function that will call "super()" with arguments passed through.
function getSuperBinding(thisEnvFn) {
  return getBinding(thisEnvFn, "supercall", () => {
    const argsBinding = thisEnvFn.scope.generateUidIdentifier("args");
    return t.arrowFunctionExpression(
      [t.restElement(argsBinding)],
      t.callExpression(t.super(), [
        t.spreadElement(t.identifier(argsBinding.name)),
      ]),
    );
  });
}

// Create a binding for a function that will call "super.foo()" or "super[foo]()".
function getSuperPropCallBinding(thisEnvFn, propName) {
  return getBinding(thisEnvFn, `superprop_call:${propName || ""}`, () => {
    const argsBinding = thisEnvFn.scope.generateUidIdentifier("args");
    const argsList = [t.restElement(argsBinding)];

    let fnBody;
    if (propName) {
      // (...args) => super.foo(...args)
      fnBody = t.callExpression(
        t.memberExpression(t.super(), t.identifier(propName)),
        [t.spreadElement(t.identifier(argsBinding.name))],
      );
    } else {
      const method = thisEnvFn.scope.generateUidIdentifier("prop");
      // (method, ...args) => super[method](...args)
      argsList.unshift(method);
      fnBody = t.callExpression(
        t.memberExpression(
          t.super(),
          t.identifier(method.name),
          true /* computed */,
        ),
        [t.spreadElement(t.identifier(argsBinding.name))],
      );
    }

    return t.arrowFunctionExpression(argsList, fnBody);
  });
}

// Create a binding for a function that will call "super.foo" or "super[foo]".
function getSuperPropBinding(thisEnvFn, isAssignment, propName) {
  const op = isAssignment ? "set" : "get";

  return getBinding(thisEnvFn, `superprop_${op}:${propName || ""}`, () => {
    const argsList = [];

    let fnBody;
    if (propName) {
      // () => super.foo
      fnBody = t.memberExpression(t.super(), t.identifier(propName));
    } else {
      const method = thisEnvFn.scope.generateUidIdentifier("prop");
      // (method) => super[method]
      argsList.unshift(method);
      fnBody = t.memberExpression(
        t.super(),
        t.identifier(method.name),
        true /* computed */,
      );
    }

    if (isAssignment) {
      const valueIdent = thisEnvFn.scope.generateUidIdentifier("value");
      argsList.push(valueIdent);

      fnBody = t.assignmentExpression(
        "=",
        fnBody,
        t.identifier(valueIdent.name),
      );
    }

    return t.arrowFunctionExpression(argsList, fnBody);
  });
}

function getBinding(thisEnvFn, key, init) {
  const cacheKey = "binding:" + key;
  let data = thisEnvFn.getData(cacheKey);
  if (!data) {
    const id = thisEnvFn.scope.generateUidIdentifier(key);
    data = id.name;
    thisEnvFn.setData(cacheKey, data);

    thisEnvFn.scope.push({
      id: id,
      init: init(data),
    });
  }

  return data;
}

function getScopeInformation(fnPath) {
  const thisPaths = [];
  const argumentsPaths = [];
  const newTargetPaths = [];
  const superProps = [];
  const superCalls = [];

  fnPath.traverse({
    Function(child) {
      if (child.isArrowFunctionExpression() || child.isClassProperty()) return;
      child.skip();
    },
    ThisExpression(child) {
      thisPaths.push(child);
    },
    JSXIdentifier(child) {
      if (child.node.name !== "this") return;
      if (
        !child.parentPath.isJSXMemberExpression({ object: child.node }) &&
        !child.parentPath.isJSXOpeningElement({ name: child.node })
      ) {
        return;
      }

      thisPaths.push(child);
    },
    CallExpression(child) {
      if (child.get("callee").isSuper()) superCalls.push(child);
    },
    MemberExpression(child) {
      if (child.get("object").isSuper()) superProps.push(child);
    },
    ReferencedIdentifier(child) {
      if (child.node.name !== "arguments") return;

      argumentsPaths.push(child);
    },
    MetaProperty(child) {
      if (!child.get("meta").isIdentifier({ name: "new" })) return;
      if (!child.get("property").isIdentifier({ name: "target" })) return;

      newTargetPaths.push(child);
    },
  });

  return {
    thisPaths,
    argumentsPaths,
    newTargetPaths,
    superProps,
    superCalls,
  };
}
