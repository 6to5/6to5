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
  };

  const referenceVisitor = {
    ReferencedIdentifier(path) {
      if (this.scope.hasOwnBinding(path.node.name)) {
        this.collision = true;
        path.skip();
      }
    },
  };

  const buildObjectDefineProperty = template(`
    Object.defineProperty(REF, KEY, {
      // configurable is false by default
      enumerable: true,
      writable: true,
      value: VALUE
    });
  `);

  const buildClassPropertySpec = (ref, { key, value, computed }) =>
    buildObjectDefineProperty({
      REF: ref,
      KEY: t.isIdentifier(key) && !computed ? t.stringLiteral(key.name) : key,
      VALUE: value ? value : t.identifier("undefined"),
    });

  const buildClassPropertyNonSpec = (ref, { key, value, computed }) =>
    t.expressionStatement(
      t.assignmentExpression(
        "=",
        t.memberExpression(ref, key, computed || t.isLiteral(key)),
        value,
      ),
    );

  return {
    inherits: syntaxClassProperties,

    capabilities: ["classProperties"],

    visitor: {
      Class(path, state) {
        const buildClassProperty = state.opts.spec
          ? buildClassPropertySpec
          : buildClassPropertyNonSpec;
        const isDerived = !!path.node.superClass;
        let constructor;
        const props = [];
        const body = path.get("body");

        for (const path of body.get("body")) {
          if (path.isClassProperty()) {
            props.push(path);
          } else if (path.isClassMethod({ kind: "constructor" })) {
            constructor = path;
          }
        }

        if (!props.length) return;

        const nodes = [];
        let ref;

        if (path.isClassExpression() || !path.node.id) {
          nameFunction(path);
          ref = path.scope.generateUidIdentifier("class");
        } else {
          // path.isClassDeclaration() && path.node.id
          ref = path.node.id;
        }

        let instanceBody = [];

        for (const prop of props) {
          const propNode = prop.node;
          if (propNode.decorators && propNode.decorators.length > 0) continue;

          // In non-spec mode, all properties without values are ignored.
          // In spec mode, *static* properties without values are still defined (see below).
          if (!state.opts.spec && !propNode.value) continue;

          const isStatic = propNode.static;

          if (isStatic) {
            nodes.push(buildClassProperty(ref, propNode));
          } else {
            if (!propNode.value) continue; // Ignore instance property with no value in spec mode
            instanceBody.push(buildClassProperty(t.thisExpression(), propNode));
          }
        }

        if (instanceBody.length) {
          if (!constructor) {
            const newConstructor = t.classMethod(
              "constructor",
              t.identifier("constructor"),
              [],
              t.blockStatement([]),
            );
            if (isDerived) {
              newConstructor.params = [t.restElement(t.identifier("args"))];
              newConstructor.body.body.push(
                t.returnStatement(
                  t.callExpression(t.super(), [
                    t.spreadElement(t.identifier("args")),
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

          for (const prop of props) {
            prop.traverse(referenceVisitor, collisionState);
            if (collisionState.collision) break;
          }

          if (collisionState.collision) {
            const initialisePropsRef = path.scope.generateUidIdentifier(
              "initialiseProps",
            );

            nodes.push(
              t.variableDeclaration("var", [
                t.variableDeclarator(
                  initialisePropsRef,
                  t.functionExpression(
                    null,
                    [],
                    t.blockStatement(instanceBody),
                  ),
                ),
              ]),
            );

            instanceBody = [
              t.expressionStatement(
                t.callExpression(
                  t.memberExpression(initialisePropsRef, t.identifier("call")),
                  [t.thisExpression()],
                ),
              ),
            ];
          }

          //

          if (isDerived) {
            const bareSupers = [];
            constructor.traverse(findBareSupers, bareSupers);
            for (const bareSuper of bareSupers) {
              bareSuper.insertAfter(instanceBody);
            }
          } else {
            constructor.get("body").unshiftContainer("body", instanceBody);
          }
        }

        for (const prop of props) {
          prop.remove();
        }

        if (!nodes.length) return;

        if (path.isClassExpression()) {
          path.scope.push({ id: ref });
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
      ArrowFunctionExpression(path) {
        const classExp = path.get("body");
        if (!classExp.isClassExpression()) return;

        const body = classExp.get("body");
        const members = body.get("body");
        if (members.some(member => member.isClassProperty())) {
          path.ensureBlock();
        }
      },
    },
  };
}
