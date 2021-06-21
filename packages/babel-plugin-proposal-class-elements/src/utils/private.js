import { template, traverse, types as t } from "@babel/core";
import { environmentVisitor } from "@babel/helper-replace-supers";
import memberExpressionToFunctions from "@babel/helper-member-expression-to-functions";
import optimiseCall from "@babel/helper-optimise-call-expression";
import annotateAsPure from "@babel/helper-annotate-as-pure";

export function pushPrivateName(privateNamesMap, prop) {
  const isMethod = !prop.isProperty();
  const isInstance = !prop.node.static;
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
    const { static: isStatic, method: isMethod } = value;
    let init;
    if (privateFieldsAsProperties) {
      init = t.callExpression(state.addHelper("classPrivateFieldLooseKey"), [
        t.stringLiteral(name),
      ]);
    } else if (isMethod) {
      if (isStatic) continue;
      init = t.newExpression(t.identifier("WeakSet"), []);
    } else if (!isStatic) {
      init = t.newExpression(t.identifier("WeakMap"), []);
    }
    if (init) annotateAsPure(init);
    initNodes.push(t.variableDeclarator(t.cloneNode(value.id), init));
  }

  return initNodes.length > 0 ? t.variableDeclaration("var", initNodes) : null;
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

    if (isAccessor) {
      if (!getId) {
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
      if (isStatic) {
        return t.sequenceExpression([
          t.callExpression(file.addHelper("classCheckPrivateStaticAccess"), [
            this.receiver(member),
            t.cloneNode(classRef),
          ]),
          t.callExpression(
            t.memberExpression(t.cloneNode(getId), t.identifier("call")),
            [t.cloneNode(classRef)],
          ),
        ]);
      } else {
        return t.callExpression(file.addHelper("classPrivateAccessorGet2"), [
          this.receiver(member),
          t.cloneNode(id),
          t.cloneNode(getId),
        ]);
      }
    }

    if (isStatic) {
      return t.sequenceExpression([
        t.callExpression(file.addHelper("classCheckPrivateStaticAccess"), [
          this.receiver(member),
          t.cloneNode(classRef),
        ]),
        t.cloneNode(id),
      ]);
    }

    if (isMethod) {
      return t.callExpression(file.addHelper("classPrivateMethodGet"), [
        this.receiver(member),
        t.cloneNode(id),
        t.cloneNode(methodId),
      ]);
    }
    return t.callExpression(file.addHelper("classPrivateFieldGet2"), [
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

    if (isAccessor) {
      if (!setId) {
        return t.sequenceExpression([
          this.receiver(member),
          t.callExpression(file.addHelper("readOnlyError"), [
            t.stringLiteral(`#${name}`),
          ]),
        ]);
      }
      if (isStatic) {
        return t.sequenceExpression([
          t.callExpression(file.addHelper("classCheckPrivateStaticAccess"), [
            this.receiver(member),
            t.cloneNode(classRef),
          ]),
          t.callExpression(
            t.memberExpression(t.cloneNode(setId), t.identifier("call")),
            [t.cloneNode(classRef), value],
          ),
        ]);
      } else {
        return t.callExpression(file.addHelper("classPrivateAccessorSet2"), [
          this.receiver(member),
          t.cloneNode(id),
          t.cloneNode(setId),
          value,
        ]);
      }
    }

    if (isMethod) {
      return t.sequenceExpression([
        this.receiver(member),
        value,
        t.callExpression(file.addHelper("readOnlyError"), [
          t.stringLiteral(`#${name}`),
        ]),
      ]);
    }
    if (isStatic) {
      return t.sequenceExpression([
        t.callExpression(file.addHelper("classCheckPrivateStaticAccess"), [
          this.receiver(member),
          t.cloneNode(classRef),
        ]),
        t.assignmentExpression("=", t.cloneNode(id), value),
      ]);
    }
    return t.callExpression(file.addHelper("classPrivateFieldSet2"), [
      this.receiver(member),
      t.cloneNode(id),
      value,
    ]);
  },

  destructureSet(member) {
    const { classRef, privateNamesMap, file } = this;
    const { name } = member.node.property.id;
    const {
      id,
      static: isStatic,
      method: isMethod,
      setId,
    } = privateNamesMap.get(name);

    if (isMethod && !setId) {
      return t.memberExpression(
        t.callExpression(file.addHelper("readOnlyError"), [
          t.stringLiteral(`#${name}`),
        ]),
        t.identifier("_"),
      );
    }

    if (isStatic) {
      if (setId) {
        return template.expression.ast`
          ${file.addHelper("classStaticPrivateAccessorDestructureSet2")}(
            ${this.receiver(member)},
            ${t.cloneNode(classRef)},
            ${t.cloneNode(setId)}
          )._
        `;
      }

      return template.expression.ast`
        ${file.addHelper("classStaticPrivateFieldDestructureSet2")}(
          ${this.receiver(member)},
          ${t.cloneNode(classRef)},
          _ => ${t.cloneNode(id)} = _
        )._
      `;
    }

    if (setId) {
      return template.expression.ast`
        ${file.addHelper("classInstancePrivateAccessorDestructureSet2")}(
          ${this.receiver(member)},
          ${t.cloneNode(id)},
          ${t.cloneNode(setId)}
        )._
      `;
    }

    return t.memberExpression(
      t.callExpression(
        file.addHelper("classInstancePrivateFieldDestructureSet2"),
        [this.receiver(member), t.cloneNode(id)],
      ),
      t.identifier("_"),
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

export function buildPrivateInstanceFieldInitSpec(
  node,
  scope,
  privateNamesMap,
) {
  const { id } = privateNamesMap.get(node.key.id.name);
  const value = node.value || scope.buildUndefinedNode();

  return template.expression.ast`${t.cloneNode(id)}.set(this, ${value})`;
}

export function buildPrivateStaticFieldInitSpec(node, scope, privateNamesMap) {
  const { value } = node;
  if (!value) return;

  const { id } = privateNamesMap.get(node.key.id.name);
  return t.assignmentExpression("=", t.cloneNode(id), value);
}

export function buildPrivateFieldInitLoose(
  node,
  scope,
  privateNamesMap,
  getClassRef = t.thisExpression,
) {
  const { id } = privateNamesMap.get(node.key.id.name);
  const value = node.value || scope.buildUndefinedNode();

  // configurable and enumerable are false by default
  return template.expression.ast`
    Object.defineProperty(${getClassRef()}, ${t.cloneNode(id)}, {
      writable: true,
      value: ${value}
    })
  `;
}

export function buildPrivateInstanceMethodInitSpec(
  node,
  scope,
  privateNamesMap,
) {
  const { name } = node.key.id;
  const privateName = privateNamesMap.get(name);
  const { id, initAdded, static: isStatic } = privateName;

  if (initAdded || isStatic) return;

  privateNamesMap.set(name, { ...privateName, initAdded: true });

  return template.expression.ast`${id}.add(this)`;
}

export function buildPrivateMethodInitLoose(
  node,
  scope,
  privateNamesMap,
  getClassRef = t.thisExpression,
) {
  const privateName = privateNamesMap.get(node.key.id.name);
  const { methodId, id, getId, setId, initAdded } = privateName;
  if (initAdded) return;

  if (methodId) {
    return template.expression.ast`
      Object.defineProperty(${getClassRef()}, ${id}, {
        // configurable is false by default
        // enumerable is false by default
        // writable is false by default
        value: ${methodId.name}
      })
    `;
  }
  const isAccessor = getId || setId;
  if (isAccessor) {
    privateNamesMap.set(node.key.id.name, {
      ...privateName,
      initAdded: true,
    });

    return template.expression.ast`
      Object.defineProperty(${getClassRef()}, ${id}, {
        // configurable is false by default
        // enumerable is false by default
        // writable is false by default
        get: ${getId ? getId.name : scope.buildUndefinedNode()},
        set: ${setId ? setId.name : scope.buildUndefinedNode()}
      })
    `;
  }
}

export function buildPrivateMethodDeclaration(
  node,
  privateNamesMap,
  privateFieldsAsProperties = false,
) {
  const { key, params, body, generator, async } = node;
  const privateName = privateNamesMap.get(key.id.name);
  const {
    id,
    methodId,
    getId,
    setId,
    getterDeclared,
    setterDeclared,
    static: isStatic,
  } = privateName;
  const isGetter = getId && !getterDeclared && params.length === 0;
  const isSetter = setId && !setterDeclared && params.length > 0;

  let declId = methodId;

  if (isGetter) {
    privateNamesMap.set(key.id.name, {
      ...privateName,
      getterDeclared: true,
    });
    declId = getId;
  } else if (isSetter) {
    privateNamesMap.set(key.id.name, {
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
