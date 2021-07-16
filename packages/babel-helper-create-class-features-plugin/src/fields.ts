import { template, traverse, types as t } from "@babel/core";
import type { NodePath } from "@babel/traverse";
import ReplaceSupers, {
  environmentVisitor,
} from "@babel/helper-replace-supers";
import memberExpressionToFunctions from "@babel/helper-member-expression-to-functions";
import optimiseCall from "@babel/helper-optimise-call-expression";
import annotateAsPure from "@babel/helper-annotate-as-pure";

import * as ts from "./typescript";

export function buildPrivateNamesMap(props) {
  const privateNamesMap = new Map();
  for (const prop of props) {
    const isPrivate = prop.isPrivate();
    const isMethod = !prop.isProperty();
    const isInstance = !prop.node.static;
    if (isPrivate) {
      const { name } = prop.node.key.id;
      const update = privateNamesMap.has(name)
        ? privateNamesMap.get(name)
        : {
            id: prop.scope.generateUidIdentifier(name),
            static: !isInstance,
            method: isMethod,
          };
      if (prop.node.kind === "get") {
        update.getId = prop.scope.generateUidIdentifier(`get_${name}`);
      } else if (prop.node.kind === "set") {
        update.setId = prop.scope.generateUidIdentifier(`set_${name}`);
      } else if (prop.node.kind === "method") {
        update.methodId = prop.scope.generateUidIdentifier(name);
      }
      privateNamesMap.set(name, update);
    }
  }
  return privateNamesMap;
}

export function buildPrivateNamesNodes(
  privateNamesMap,
  privateFieldsAsProperties,
  state,
) {
  const initNodes = [];

  for (const [name, value] of privateNamesMap) {
    // When the privateFieldsAsProperties assumption is enabled,
    // both static and instance fields are transpiled using a
    // secret non-enumerable property. Hence, we also need to generate that
    // key (using the classPrivateFieldLooseKey helper).
    // In spec mode, only instance fields need a "private name" initializer
    // because static fields are directly assigned to a variable in the
    // buildPrivateStaticFieldInitSpec function.
    const { static: isStatic, method: isMethod, getId, setId } = value;
    const isAccessor = getId || setId;
    const id = t.cloneNode(value.id);

    let init;

    if (privateFieldsAsProperties) {
      init = t.callExpression(state.addHelper("classPrivateFieldLooseKey"), [
        t.stringLiteral(name),
      ]);
    } else if (!isStatic) {
      init = t.newExpression(
        t.identifier(!isMethod || isAccessor ? "WeakMap" : "WeakSet"),
        [],
      );
    }

    if (init) {
      annotateAsPure(init);
      initNodes.push(template.statement.ast`var ${id} = ${init}`);
    }
  }

  return initNodes;
}

// Traverses the class scope, handling private name references. If an inner
// class redeclares the same private name, it will hand off traversal to the
// restricted visitor (which doesn't traverse the inner class's inner scope).
function privateNameVisitorFactory(visitor) {
  const privateNameVisitor = {
    ...visitor,

    Class(path) {
      const { privateNamesMap } = this;
      const body = path.get("body.body");

      const visiblePrivateNames = new Map(privateNamesMap);
      const redeclared = [];
      for (const prop of body) {
        if (!prop.isPrivate()) continue;
        const { name } = prop.node.key.id;
        visiblePrivateNames.delete(name);
        redeclared.push(name);
      }

      // If the class doesn't redeclare any private fields, we can continue with
      // our overall traversal.
      if (!redeclared.length) {
        return;
      }

      // This class redeclares some private field. We need to process the outer
      // environment with access to all the outer privates, then we can process
      // the inner environment with only the still-visible outer privates.
      path.get("body").traverse(nestedVisitor, {
        ...this,
        redeclared,
      });
      path.traverse(privateNameVisitor, {
        ...this,
        privateNamesMap: visiblePrivateNames,
      });

      // We'll eventually hit this class node again with the overall Class
      // Features visitor, which'll process the redeclared privates.
      path.skipKey("body");
    },
  };

  // Traverses the outer portion of a class, without touching the class's inner
  // scope, for private names.
  const nestedVisitor = traverse.visitors.merge([
    {
      ...visitor,
    },
    environmentVisitor,
  ]);

  return privateNameVisitor;
}

const privateNameVisitor = privateNameVisitorFactory({
  PrivateName(path, { noDocumentAll }) {
    const { privateNamesMap, redeclared } = this;
    const { node, parentPath } = path;

    if (
      !parentPath.isMemberExpression({ property: node }) &&
      !parentPath.isOptionalMemberExpression({ property: node })
    ) {
      return;
    }
    const { name } = node.id;
    if (!privateNamesMap.has(name)) return;
    if (redeclared && redeclared.includes(name)) return;

    this.handle(parentPath, noDocumentAll);
  },
});

const privateInVisitor = privateNameVisitorFactory({
  BinaryExpression(path) {
    const { operator, left, right } = path.node;
    if (operator !== "in") return;
    if (!path.get("left").isPrivateName()) return;

    const { privateFieldsAsProperties, privateNamesMap, redeclared } = this;
    const { name } = left.id;

    if (!privateNamesMap.has(name)) return;
    if (redeclared && redeclared.includes(name)) return;

    if (privateFieldsAsProperties) {
      const { id } = privateNamesMap.get(name);
      path.replaceWith(template.expression.ast`
        Object.prototype.hasOwnProperty.call(${right}, ${t.cloneNode(id)})
      `);
      return;
    }

    const { id, static: isStatic } = privateNamesMap.get(name);

    if (isStatic) {
      path.replaceWith(template.expression.ast`${right} === ${this.classRef}`);
      return;
    }

    path.replaceWith(template.expression.ast`${t.cloneNode(id)}.has(${right})`);
  },
});

const privateNameHandlerSpec = {
  memoise(member, count) {
    const { scope } = member;
    const { object } = member.node;

    const memo = scope.maybeGenerateMemoised(object);
    if (!memo) {
      return;
    }

    this.memoiser.set(object, memo, count);
  },

  receiver(member) {
    const { object } = member.node;

    if (this.memoiser.has(object)) {
      return t.cloneNode(this.memoiser.get(object));
    }

    return t.cloneNode(object);
  },

  get(member) {
    const { classRef, privateNamesMap, file } = this;
    const { name } = member.node.property.id;
    const {
      id,
      static: isStatic,
      method: isMethod,
      methodId,
      getId,
      setId,
    } = privateNamesMap.get(name);
    const isAccessor = getId || setId;

    if (isStatic) {
      const helperName =
        isMethod && !isAccessor
          ? "classStaticPrivateMethodGet"
          : "classStaticPrivateFieldSpecGet";

      return t.callExpression(file.addHelper(helperName), [
        this.receiver(member),
        t.cloneNode(classRef),
        t.cloneNode(id),
      ]);
    }

    if (isMethod) {
      if (isAccessor) {
        if (!getId && setId) {
          if (file.availableHelper("writeOnlyError")) {
            return t.sequenceExpression([
              this.receiver(member),
              t.callExpression(file.addHelper("writeOnlyError"), [
                t.stringLiteral(`#${name}`),
              ]),
            ]);
          }
          console.warn(
            `@babel/helpers is outdated, update it to silence this warning.`,
          );
        }
        return t.callExpression(file.addHelper("classPrivateFieldGet"), [
          this.receiver(member),
          t.cloneNode(id),
        ]);
      }
      return t.callExpression(file.addHelper("classPrivateMethodGet"), [
        this.receiver(member),
        t.cloneNode(id),
        t.cloneNode(methodId),
      ]);
    }
    return t.callExpression(file.addHelper("classPrivateFieldGet"), [
      this.receiver(member),
      t.cloneNode(id),
    ]);
  },

  boundGet(member) {
    this.memoise(member, 1);

    return t.callExpression(
      t.memberExpression(this.get(member), t.identifier("bind")),
      [this.receiver(member)],
    );
  },

  set(member, value) {
    const { classRef, privateNamesMap, file } = this;
    const { name } = member.node.property.id;
    const {
      id,
      static: isStatic,
      method: isMethod,
      setId,
      getId,
    } = privateNamesMap.get(name);
    const isAccessor = getId || setId;

    if (isStatic) {
      const helperName =
        isMethod && !isAccessor
          ? "classStaticPrivateMethodSet"
          : "classStaticPrivateFieldSpecSet";

      return t.callExpression(file.addHelper(helperName), [
        this.receiver(member),
        t.cloneNode(classRef),
        t.cloneNode(id),
        value,
      ]);
    }
    if (isMethod) {
      if (setId) {
        return t.callExpression(file.addHelper("classPrivateFieldSet"), [
          this.receiver(member),
          t.cloneNode(id),
          value,
        ]);
      }
      return t.sequenceExpression([
        this.receiver(member),
        value,
        t.callExpression(file.addHelper("readOnlyError"), [
          t.stringLiteral(`#${name}`),
        ]),
      ]);
    }
    return t.callExpression(file.addHelper("classPrivateFieldSet"), [
      this.receiver(member),
      t.cloneNode(id),
      value,
    ]);
  },

  destructureSet(member) {
    const { classRef, privateNamesMap, file } = this;
    const { name } = member.node.property.id;
    const { id, static: isStatic } = privateNamesMap.get(name);
    if (isStatic) {
      try {
        // classStaticPrivateFieldDestructureSet was introduced in 7.13.10
        // eslint-disable-next-line no-var
        var helper = file.addHelper("classStaticPrivateFieldDestructureSet");
      } catch {
        throw new Error(
          "Babel can not transpile `[C.#p] = [0]` with @babel/helpers < 7.13.10, \n" +
            "please update @babel/helpers to the latest version.",
        );
      }
      return t.memberExpression(
        t.callExpression(helper, [
          this.receiver(member),
          t.cloneNode(classRef),
          t.cloneNode(id),
        ]),
        t.identifier("value"),
      );
    }

    return t.memberExpression(
      t.callExpression(file.addHelper("classPrivateFieldDestructureSet"), [
        this.receiver(member),
        t.cloneNode(id),
      ]),
      t.identifier("value"),
    );
  },

  call(member, args) {
    // The first access (the get) should do the memo assignment.
    this.memoise(member, 1);

    return optimiseCall(this.get(member), this.receiver(member), args, false);
  },

  optionalCall(member, args) {
    this.memoise(member, 1);

    return optimiseCall(this.get(member), this.receiver(member), args, true);
  },
};

const privateNameHandlerLoose = {
  get(member) {
    const { privateNamesMap, file } = this;
    const { object } = member.node;
    const { name } = member.node.property.id;

    return template.expression`BASE(REF, PROP)[PROP]`({
      BASE: file.addHelper("classPrivateFieldLooseBase"),
      REF: t.cloneNode(object),
      PROP: t.cloneNode(privateNamesMap.get(name).id),
    });
  },

  boundGet(member) {
    return t.callExpression(
      t.memberExpression(this.get(member), t.identifier("bind")),
      [t.cloneNode(member.node.object)],
    );
  },

  simpleSet(member) {
    return this.get(member);
  },

  destructureSet(member) {
    return this.get(member);
  },

  call(member, args) {
    return t.callExpression(this.get(member), args);
  },

  optionalCall(member, args) {
    return t.optionalCallExpression(this.get(member), args, true);
  },
};

export function transformPrivateNamesUsage(
  ref,
  path,
  privateNamesMap,
  { privateFieldsAsProperties, noDocumentAll },
  state,
) {
  if (!privateNamesMap.size) return;

  const body = path.get("body");
  const handler = privateFieldsAsProperties
    ? privateNameHandlerLoose
    : privateNameHandlerSpec;

  memberExpressionToFunctions(body, privateNameVisitor, {
    privateNamesMap,
    classRef: ref,
    file: state,
    ...handler,
    noDocumentAll,
  });
  body.traverse(privateInVisitor, {
    privateNamesMap,
    classRef: ref,
    file: state,
    privateFieldsAsProperties,
  });
}

function buildPrivateFieldInitLoose(ref, prop, privateNamesMap) {
  const { id } = privateNamesMap.get(prop.node.key.id.name);
  const value = prop.node.value || prop.scope.buildUndefinedNode();

  return template.statement.ast`
    Object.defineProperty(${ref}, ${t.cloneNode(id)}, {
      // configurable is false by default
      // enumerable is false by default
      writable: true,
      value: ${value}
    });
  `;
}

function buildPrivateInstanceFieldInitSpec(ref, prop, privateNamesMap) {
  const { id } = privateNamesMap.get(prop.node.key.id.name);
  const value = prop.node.value || prop.scope.buildUndefinedNode();

  return template.statement.ast`${t.cloneNode(id)}.set(${ref}, {
    // configurable is always false for private elements
    // enumerable is always false for private elements
    writable: true,
    value: ${value},
  })`;
}

function buildPrivateStaticFieldInitSpec(prop, privateNamesMap) {
  const privateName = privateNamesMap.get(prop.node.key.id.name);
  const { id, getId, setId, initAdded } = privateName;
  const isAccessor = getId || setId;

  if (!prop.isProperty() && (initAdded || !isAccessor)) return;

  if (isAccessor) {
    privateNamesMap.set(prop.node.key.id.name, {
      ...privateName,
      initAdded: true,
    });

    return template.statement.ast`
      var ${t.cloneNode(id)} = {
        // configurable is false by default
        // enumerable is false by default
        // writable is false by default
        get: ${getId ? getId.name : prop.scope.buildUndefinedNode()},
        set: ${setId ? setId.name : prop.scope.buildUndefinedNode()}
      }
    `;
  }

  const value = prop.node.value || prop.scope.buildUndefinedNode();
  return template.statement.ast`
    var ${t.cloneNode(id)} = {
      // configurable is false by default
      // enumerable is false by default
      writable: true,
      value: ${value}
    };
  `;
}

function buildPrivateMethodInitLoose(ref, prop, privateNamesMap) {
  const privateName = privateNamesMap.get(prop.node.key.id.name);
  const { methodId, id, getId, setId, initAdded } = privateName;
  if (initAdded) return;

  if (methodId) {
    return template.statement.ast`
        Object.defineProperty(${ref}, ${id}, {
          // configurable is false by default
          // enumerable is false by default
          // writable is false by default
          value: ${methodId.name}
        });
      `;
  }
  const isAccessor = getId || setId;
  if (isAccessor) {
    privateNamesMap.set(prop.node.key.id.name, {
      ...privateName,
      initAdded: true,
    });

    return template.statement.ast`
      Object.defineProperty(${ref}, ${id}, {
        // configurable is false by default
        // enumerable is false by default
        // writable is false by default
        get: ${getId ? getId.name : prop.scope.buildUndefinedNode()},
        set: ${setId ? setId.name : prop.scope.buildUndefinedNode()}
      });
    `;
  }
}

function buildPrivateInstanceMethodInitSpec(ref, prop, privateNamesMap) {
  const privateName = privateNamesMap.get(prop.node.key.id.name);
  const { id, getId, setId, initAdded } = privateName;

  if (initAdded) return;

  const isAccessor = getId || setId;
  if (isAccessor) {
    privateNamesMap.set(prop.node.key.id.name, {
      ...privateName,
      initAdded: true,
    });

    return template.statement.ast`
      ${id}.set(${ref}, {
        get: ${getId ? getId.name : prop.scope.buildUndefinedNode()},
        set: ${setId ? setId.name : prop.scope.buildUndefinedNode()}
      });
    `;
  }
  return template.statement.ast`${id}.add(${ref})`;
}

function buildPublicFieldInitLoose(ref, prop) {
  const { key, computed } = prop.node;
  const value = prop.node.value || prop.scope.buildUndefinedNode();

  return t.expressionStatement(
    t.assignmentExpression(
      "=",
      t.memberExpression(ref, key, computed || t.isLiteral(key)),
      value,
    ),
  );
}

function buildPublicFieldInitSpec(ref, prop, state) {
  const { key, computed } = prop.node;
  const value = prop.node.value || prop.scope.buildUndefinedNode();

  return t.expressionStatement(
    t.callExpression(state.addHelper("defineProperty"), [
      ref,
      computed || t.isLiteral(key) ? key : t.stringLiteral(key.name),
      value,
    ]),
  );
}

function buildPrivateStaticMethodInitLoose(ref, prop, state, privateNamesMap) {
  const privateName = privateNamesMap.get(prop.node.key.id.name);
  const { id, methodId, getId, setId, initAdded } = privateName;

  if (initAdded) return;

  const isAccessor = getId || setId;
  if (isAccessor) {
    privateNamesMap.set(prop.node.key.id.name, {
      ...privateName,
      initAdded: true,
    });

    return template.statement.ast`
      Object.defineProperty(${ref}, ${id}, {
        // configurable is false by default
        // enumerable is false by default
        // writable is false by default
        get: ${getId ? getId.name : prop.scope.buildUndefinedNode()},
        set: ${setId ? setId.name : prop.scope.buildUndefinedNode()}
      })
    `;
  }

  return template.statement.ast`
    Object.defineProperty(${ref}, ${id}, {
      // configurable is false by default
      // enumerable is false by default
      // writable is false by default
      value: ${methodId.name}
    });
  `;
}

function buildPrivateMethodDeclaration(
  prop,
  privateNamesMap,
  privateFieldsAsProperties = false,
) {
  const privateName = privateNamesMap.get(prop.node.key.id.name);
  const {
    id,
    methodId,
    getId,
    setId,
    getterDeclared,
    setterDeclared,
    static: isStatic,
  } = privateName;
  const { params, body, generator, async } = prop.node;
  const isGetter = getId && !getterDeclared && params.length === 0;
  const isSetter = setId && !setterDeclared && params.length > 0;

  let declId = methodId;

  if (isGetter) {
    privateNamesMap.set(prop.node.key.id.name, {
      ...privateName,
      getterDeclared: true,
    });
    declId = getId;
  } else if (isSetter) {
    privateNamesMap.set(prop.node.key.id.name, {
      ...privateName,
      setterDeclared: true,
    });
    declId = setId;
  } else if (isStatic && !privateFieldsAsProperties) {
    declId = id;
  }

  return t.functionDeclaration(
    t.cloneNode(declId),
    params,
    body,
    generator,
    async,
  );
}

const thisContextVisitor = traverse.visitors.merge([
  {
    ThisExpression(path, state) {
      state.needsClassRef = true;
      path.replaceWith(t.cloneNode(state.classRef));
    },
    Function(path: NodePath<t.Function>, state) {
      // only `() => { new.target }` needs to be replaced
      state.shouldReplaceNewTarget = path.isArrowFunctionExpression();
    },
    MetaProperty(path: NodePath<t.MetaProperty>, state) {
      const meta = path.get("meta");
      const property = path.get("property");
      const { scope } = path;
      // if there are `new.target` in static field
      // we should replace it with `undefined`
      if (
        state.shouldReplaceNewTarget &&
        meta.isIdentifier({ name: "new" }) &&
        property.isIdentifier({ name: "target" })
      ) {
        path.replaceWith(scope.buildUndefinedNode());
      }
    },
  },
  environmentVisitor,
]);

const innerReferencesVisitor = {
  ReferencedIdentifier(path, state) {
    if (
      path.scope.bindingIdentifierEquals(path.node.name, state.innerBinding)
    ) {
      state.needsClassRef = true;
      path.node.name = state.classRef.name;
    }
  },
};

function replaceThisContext(
  path,
  ref,
  getSuperRef,
  file,
  isStaticBlock,
  constantSuper,
  innerBindingRef,
) {
  const state = {
    classRef: ref,
    needsClassRef: false,
    innerBinding: innerBindingRef,
    shouldReplaceNewTarget: true,
  };

  const replacer = new ReplaceSupers({
    methodPath: path,
    constantSuper,
    file,
    refToPreserve: ref,
    getSuperRef,
    getObjectRef() {
      state.needsClassRef = true;
      return isStaticBlock || path.node.static
        ? ref
        : t.memberExpression(ref, t.identifier("prototype"));
    },
  });
  replacer.replace();
  if (isStaticBlock || path.isProperty()) {
    path.traverse(thisContextVisitor, state);
  }

  if (state.classRef?.name && state.classRef.name !== innerBindingRef?.name) {
    path.traverse(innerReferencesVisitor, state);
  }

  return state.needsClassRef;
}

export function buildFieldsInitNodes(
  ref,
  superRef,
  props,
  privateNamesMap,
  state,
  setPublicClassFields,
  privateFieldsAsProperties,
  constantSuper,
  innerBindingRef,
) {
  let needsClassRef = false;
  let injectSuperRef;
  const staticNodes = [];
  const instanceNodes = [];
  // These nodes are pure and can be moved to the closest statement position
  const pureStaticNodes = [];

  const getSuperRef = t.isIdentifier(superRef)
    ? () => superRef
    : () => {
        injectSuperRef ??=
          props[0].scope.generateUidIdentifierBasedOnNode(superRef);
        return injectSuperRef;
      };

  for (const prop of props) {
    ts.assertFieldTransformed(prop);

    const isStatic = prop.node.static;
    const isInstance = !isStatic;
    const isPrivate = prop.isPrivate();
    const isPublic = !isPrivate;
    const isField = prop.isProperty();
    const isMethod = !isField;
    const isStaticBlock = prop.isStaticBlock?.();

    if (isStatic || (isMethod && isPrivate) || isStaticBlock) {
      const replaced = replaceThisContext(
        prop,
        ref,
        getSuperRef,
        state,
        isStaticBlock,
        constantSuper,
        innerBindingRef,
      );
      needsClassRef = needsClassRef || replaced;
    }

    switch (true) {
      case isStaticBlock:
        staticNodes.push(
          template.statement.ast`(() => ${t.blockStatement(prop.node.body)})()`,
        );
        break;
      case isStatic && isPrivate && isField && privateFieldsAsProperties:
        needsClassRef = true;
        staticNodes.push(
          buildPrivateFieldInitLoose(t.cloneNode(ref), prop, privateNamesMap),
        );
        break;
      case isStatic && isPrivate && isField && !privateFieldsAsProperties:
        needsClassRef = true;
        staticNodes.push(
          buildPrivateStaticFieldInitSpec(prop, privateNamesMap),
        );
        break;
      case isStatic && isPublic && isField && setPublicClassFields:
        needsClassRef = true;
        staticNodes.push(buildPublicFieldInitLoose(t.cloneNode(ref), prop));
        break;
      case isStatic && isPublic && isField && !setPublicClassFields:
        needsClassRef = true;
        staticNodes.push(
          buildPublicFieldInitSpec(t.cloneNode(ref), prop, state),
        );
        break;
      case isInstance && isPrivate && isField && privateFieldsAsProperties:
        instanceNodes.push(
          buildPrivateFieldInitLoose(t.thisExpression(), prop, privateNamesMap),
        );
        break;
      case isInstance && isPrivate && isField && !privateFieldsAsProperties:
        instanceNodes.push(
          buildPrivateInstanceFieldInitSpec(
            t.thisExpression(),
            prop,
            privateNamesMap,
          ),
        );
        break;
      case isInstance && isPrivate && isMethod && privateFieldsAsProperties:
        instanceNodes.unshift(
          buildPrivateMethodInitLoose(
            t.thisExpression(),
            prop,
            privateNamesMap,
          ),
        );
        pureStaticNodes.push(
          buildPrivateMethodDeclaration(
            prop,
            privateNamesMap,
            privateFieldsAsProperties,
          ),
        );
        break;
      case isInstance && isPrivate && isMethod && !privateFieldsAsProperties:
        instanceNodes.unshift(
          buildPrivateInstanceMethodInitSpec(
            t.thisExpression(),
            prop,
            privateNamesMap,
          ),
        );
        pureStaticNodes.push(
          buildPrivateMethodDeclaration(
            prop,
            privateNamesMap,
            privateFieldsAsProperties,
          ),
        );
        break;
      case isStatic && isPrivate && isMethod && !privateFieldsAsProperties:
        needsClassRef = true;
        staticNodes.unshift(
          buildPrivateStaticFieldInitSpec(prop, privateNamesMap),
        );
        pureStaticNodes.push(
          buildPrivateMethodDeclaration(
            prop,
            privateNamesMap,
            privateFieldsAsProperties,
          ),
        );
        break;
      case isStatic && isPrivate && isMethod && privateFieldsAsProperties:
        needsClassRef = true;
        staticNodes.unshift(
          buildPrivateStaticMethodInitLoose(
            t.cloneNode(ref),
            prop,
            state,
            privateNamesMap,
          ),
        );
        pureStaticNodes.push(
          buildPrivateMethodDeclaration(
            prop,
            privateNamesMap,
            privateFieldsAsProperties,
          ),
        );
        break;
      case isInstance && isPublic && isField && setPublicClassFields:
        instanceNodes.push(buildPublicFieldInitLoose(t.thisExpression(), prop));
        break;
      case isInstance && isPublic && isField && !setPublicClassFields:
        instanceNodes.push(
          buildPublicFieldInitSpec(t.thisExpression(), prop, state),
        );
        break;
      default:
        throw new Error("Unreachable.");
    }
  }

  return {
    staticNodes: staticNodes.filter(Boolean),
    instanceNodes: instanceNodes.filter(Boolean),
    pureStaticNodes: pureStaticNodes.filter(Boolean),
    wrapClass(path) {
      for (const prop of props) {
        prop.remove();
      }

      if (injectSuperRef) {
        path.scope.push({ id: t.cloneNode(injectSuperRef) });
        path.set(
          "superClass",
          t.assignmentExpression("=", injectSuperRef, path.node.superClass),
        );
      }

      if (!needsClassRef) return path;

      if (path.isClassExpression()) {
        path.scope.push({ id: ref });
        path.replaceWith(
          t.assignmentExpression("=", t.cloneNode(ref), path.node),
        );
      } else if (!path.node.id) {
        // Anonymous class declaration
        path.node.id = ref;
      }

      return path;
    },
  };
}
