import nameFunction from "babel-helper-function-name";
import template from "babel-template";
import syntaxClassProperties from "babel-plugin-syntax-class-properties";

export default function({ types: t }) {
  const findBareSupers = {
    Super(path) {
      if (path.parentPath.isCallExpression({ callee: path.node })) {
        this.push(path.parentPath);
      }
    },

    Class(path) {
      path.skip();
    },

    Function(path) {
      if (path.isArrowFunctionExpression()) return;
      path.skip();
    },
  };

  const collisionVisitor = {
    TypeAnnotation(path) {
      path.skip();
    },

    ReferencedIdentifier(path) {
      if (this.scope.hasOwnBinding(path.node.name)) {
        this.collision = true;
        path.stop();
      }
    },
  };

  const remapThisVisitor = {
    ThisExpression(path) {
      path.replaceWith(this.thisRef);
    },

    Function(path) {
      if (path.isArrowFunctionExpression()) return;
      path.skip();
    },
  };

  const staticErrorVisitor = {
    Identifier(path) {
      if (path.node.name === "arguments") {
        const parent = path.findParent(path => {
          return (
            path.isProperty() ||
            (path.isFunction() && !path.isArrowFunctionExpression())
          );
        });
        if (parent.isProperty()) {
          throw path.buildCodeFrameError("cannot reference arguments");
        }
      }
    },

    Class(path) {
      path.skip();
    },

    // TODO make this better
    ClassProperty(path) {
      const { computed, key, static: isStatic } = path.node;
      if (computed) return;

      const name = t.isIdentifier(key) ? key.name : key.value;
      if (isStatic && name === "prototype") {
        throw path.buildCodeFrameError("illegal static class field");
      }

      const seen = isStatic ? this.publicStaticProps : this.publicProps;
      if (seen[name]) {
        throw path.buildCodeFrameError("duplicate class field");
      }
      seen[name] = true;
    },

    ClassPrivateProperty(path) {
      const name = path.node.key.name;
      const seen = this.privateProps;
      if (seen[name]) {
        throw path.buildCodeFrameError("duplicate class field");
      }
      seen[name] = true;
    },

    PrivateName(path) {
      const { parentPath, node } = path;
      if (!parentPath.isMemberExpression({ property: node, computed: false })) {
        throw path.buildCodeFrameError("This syntax sucks and I'm not sorry.");
      }
    },
  };

  const privateNameVisitor = {
    PrivateName(path) {
      const { node, parentPath } = path;
      if (node.name.name !== this.name) {
        return;
      }

      const grandParentPath = parentPath.parentPath;
      const { object } = parentPath.node;

      let replacePath = parentPath;
      let replaceWith = t.callExpression(this.get, [object, this.privateMap]);

      if (
        grandParentPath.isAssignmentExpression() ||
        grandParentPath.isUpdateExpression()
      ) {
        const { node } = grandParentPath;
        let assign;
        let memo;

        if (grandParentPath.isAssignmentExpression()) {
          const { operator, right } = node;
          if (operator === "=") {
            assign = right;
          } else {
            memo = path.scope.maybeGenerateMemoised(object);
            assign = t.binaryExpression(
              operator.slice(0, -1),
              replaceWith,
              right,
            );
          }
        } else {
          memo = path.scope.maybeGenerateMemoised(object);
          assign = t.binaryExpression(
            node.operator.slice(0, 1),
            replaceWith,
            t.numericLiteral(1),
          );
        }

        if (memo) {
          replaceWith.arguments[0] = t.assignmentExpression("=", memo, object);
        }

        replacePath = grandParentPath;
        replaceWith = t.callExpression(this.set, [
          memo || object,
          this.privateMap,
          assign,
        ]);
      } else if (
        grandParentPath.isCallExpression({ callee: parentPath.node })
      ) {
        const memo = path.scope.maybeGenerateMemoised(object);
        if (memo) {
          replaceWith.arguments[0] = t.assignmentExpression("=", memo, object);
        }

        replacePath = grandParentPath;
        const call = t.clone(grandParentPath.node);
        call.callee = t.memberExpression(replaceWith, t.identifier("call"));
        call.arguments.unshift(memo || object);
        replaceWith = call;
      }

      replacePath.replaceWith(replaceWith);
    },

    Class(path) {
      path.skip();
    },
  };

  const buildNormalProperty = template(`
    Object.defineProperty(REF, KEY, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: VALUE
    });
  `);

  const buildWritableProperty = template(`
    Object.defineProperty(REF, KEY, {
      // configurable is false by default
      // enumerable is false by default
      writable: true,
      value: VALUE
    });
  `);

  function buildPublicClassPropertySpec(ref, prop) {
    const { key, value, computed } = prop.node;
    return buildNormalProperty({
      REF: ref,
      KEY: t.isIdentifier(key) && !computed ? t.stringLiteral(key.name) : key,
      VALUE: value || prop.scope.buildUndefinedNode(),
    });
  }

  function buildPublicClassPropertyLoose(ref, prop) {
    const { key, value, computed } = prop.node;
    return t.expressionStatement(
      t.assignmentExpression(
        "=",
        t.memberExpression(ref, key, computed || t.isLiteral(key)),
        value || prop.scope.buildUndefinedNode(),
      ),
    );
  }

  function buildPrivateClassPropertySpec(ref, prop, klass, nodes) {
    const { node } = prop;
    const { value } = node;
    const { name } = node.key;
    const { file } = klass.hub;
    const privateMap = buildPrivateClassProperty(ref, klass, nodes, {
      name,
      buildMap: t.newExpression(t.identifier("WeakMap"), []),
      get: file.addHelper("privateClassPropertyGetSpec"),
      set: file.addHelper("privateClassPropertyPutSpec"),
    });

    return t.expressionStatement(
      t.callExpression(t.memberExpression(privateMap, t.identifier("set")), [
        ref,
        value || klass.scope.buildUndefinedNode(),
      ]),
    );
  }

  // TODO no need anymore
  function buildPrivateClassProperty(ref, klass, nodes, state) {
    const privateMap = klass.scope.generateDeclaredUidIdentifier(state.name);
    state.privateMap = privateMap;

    klass.traverse(privateNameVisitor, state);
    nodes.push(
      t.expressionStatement(
        t.assignmentExpression("=", privateMap, state.buildMap),
      ),
    );

    return privateMap;
  }

  function buildPrivateClassPropertyLoose(ref, prop, klass, nodes) {
    const { key, value } = prop.node;
    const { name } = key;
    const privateName = klass.scope.generateDeclaredUidIdentifier(name);

    klass.traverse({
      PrivateName(path) {
        const { parentPath, node } = path;
        if (node.name.name !== name) {
          return;
        }

        parentPath.node.computed = true;
        path.replaceWith(privateName);
      },

      Class(path) {
        path.skip();
      },
    });

    nodes.push(
      t.expressionStatement(
        t.assignmentExpression(
          "=",
          privateName,
          t.callExpression(
            klass.hub.file.addHelper("privateClassPropertyKey"),
            [t.stringLiteral(name)],
          ),
        ),
      ),
    );

    return buildWritableProperty({
      REF: ref,
      KEY: privateName,
      VALUE: value || prop.scope.buildUndefinedNode(),
    });
  }

  return {
    inherits: syntaxClassProperties,

    visitor: {
      Class(path, state) {
        const buildPublicClassProperty = state.opts.loose
          ? buildPublicClassPropertyLoose
          : buildPublicClassPropertySpec;
        const buildPrivateClassProperty = state.opts.loose
          ? buildPrivateClassPropertyLoose
          : buildPrivateClassPropertySpec;
        const isDerived = !!path.node.superClass;

        const instanceProps = [];
        const staticProps = [];
        const body = path.get("body");
        const { scope } = path;
        let constructor;

        path.traverse(staticErrorVisitor, {
          publicProps: Object.create(null),
          publicStaticProps: Object.create(null),
          privateProps: Object.create(null),
        });

        for (const path of body.get("body")) {
          if (path.isProperty()) {
            const { decorators } = path.node;
            if (decorators && decorators.length) continue;

            if (path.node.static) {
              staticProps.push(path);
            } else {
              instanceProps.push(path);
            }
          } else if (path.isClassMethod({ kind: "constructor" })) {
            constructor = path;
          }
        }

        if (!instanceProps.length && !staticProps.length) return;

        let ref;

        if (path.isClassExpression() || !path.node.id) {
          nameFunction(path);
          ref = scope.generateUidIdentifier("class");
        } else {
          // path.isClassDeclaration() && path.node.id
          ref = path.node.id;
        }

        const nodes = [];
        let instanceBody = [];

        for (const prop of staticProps) {
          if (prop.isClassPrivateProperty()) {
            nodes.push(buildPrivateClassProperty(ref, prop, path, nodes));
          } else {
            nodes.push(buildPublicClassProperty(ref, prop));
          }
        }

        if (instanceProps.length) {
          if (!constructor) {
            const newConstructor = t.classMethod(
              "constructor",
              t.identifier("constructor"),
              [],
              t.blockStatement([]),
            );

            if (isDerived) {
              newConstructor.body.body.push(
                t.returnStatement(
                  t.callExpression(t.super(), [
                    t.spreadElement(t.identifier("arguments")),
                  ]),
                ),
              );
            }

            [constructor] = body.unshiftContainer("body", newConstructor);
          }

          const collisionState = {
            collision: false,
            scope: constructor.scope,
          };
          const bareSupers = [];

          if (isDerived) {
            constructor.traverse(findBareSupers, bareSupers);
          }

          if (bareSupers.length <= 1) {
            for (const prop of instanceProps) {
              prop.traverse(collisionVisitor, collisionState);
              if (collisionState.collision) break;
            }
          }

          const extract = bareSupers.length > 1 || collisionState.collision;
          const thisRef = extract
            ? scope.generateUidIdentifier("this")
            : t.thisExpression();

          for (const prop of instanceProps) {
            if (extract) {
              prop.traverse(remapThisVisitor, { thisRef });
            }

            if (prop.isClassPrivateProperty()) {
              instanceBody.push(
                buildPrivateClassProperty(thisRef, prop, path, nodes),
              );
            } else {
              instanceBody.push(buildPublicClassProperty(thisRef, prop));
            }
          }

          if (extract) {
            const initialisePropsRef = scope.generateUidIdentifier(
              "initialiseProps",
            );

            nodes.push(
              t.variableDeclaration("var", [
                t.variableDeclarator(
                  initialisePropsRef,
                  t.functionExpression(
                    null,
                    [thisRef],
                    t.blockStatement(instanceBody),
                  ),
                ),
              ]),
            );

            instanceBody = [
              t.expressionStatement(
                t.callExpression(initialisePropsRef, [t.thisExpression()]),
              ),
            ];
          }

          if (bareSupers.length) {
            for (const bareSuper of bareSupers) {
              bareSuper.insertAfter(instanceBody);
            }
          } else {
            constructor.get("body").unshiftContainer("body", instanceBody);
          }
        }

        for (const prop of [...staticProps, ...instanceProps]) {
          prop.remove();
        }

        if (!nodes.length) return;

        if (path.isClassExpression()) {
          scope.push({ id: ref });
          path.replaceWith(t.assignmentExpression("=", ref, path.node));
        } else {
          // path.isClassDeclaration()
          if (!path.node.id) {
            path.node.id = ref;
          }

          if (path.parentPath.isExportDeclaration()) {
            path = path.parentPath;
          }
        }

        path.insertAfter(nodes);
      },

      PrivateName(path) {
        throw path.buildCodeFrameError(
          "PrivateName is illegal outside ClassBody",
        );
      },

      ArrowFunctionExpression(path) {
        const classExp = path.get("body");
        if (!classExp.isClassExpression()) return;

        const body = classExp.get("body");
        const members = body.get("body");
        if (members.some(member => member.isProperty())) {
          path.ensureBlock();
        }
      },
    },
  };
}
