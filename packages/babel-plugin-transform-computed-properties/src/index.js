import { template, types as t } from "@babel/core";

export default function(api, options) {
  const { loose } = options;
  const pushComputedProps = loose
    ? pushComputedPropsLoose
    : pushComputedPropsSpec;

  const buildMutatorMapAssign = template(`
    MUTATOR_MAP_REF[KEY] = MUTATOR_MAP_REF[KEY] || {};
    MUTATOR_MAP_REF[KEY].KIND = VALUE;
  `);

  function getValue(prop) {
    if (t.isObjectProperty(prop)) {
      return prop.value;
    } else if (t.isObjectMethod(prop)) {
      return t.functionExpression(
        null,
        prop.params,
        prop.body,
        prop.generator,
        prop.async,
      );
    }
  }

  function pushAssign({ getObjId, deoptObjRef }, prop, body) {
    deoptObjRef();
    body.push(
      t.expressionStatement(
        t.assignmentExpression(
          "=",
          t.memberExpression(
            getObjId(),
            prop.key,
            prop.computed || t.isLiteral(prop.key),
          ),
          getValue(prop),
        ),
      ),
    );
  }

  function pushMutatorDefine({ body, getMutatorId, scope }, prop) {
    let key =
      !prop.computed && t.isIdentifier(prop.key)
        ? t.stringLiteral(prop.key.name)
        : prop.key;

    const maybeMemoise = scope.maybeGenerateMemoised(key);
    if (maybeMemoise) {
      body.push(
        t.expressionStatement(t.assignmentExpression("=", maybeMemoise, key)),
      );
      key = maybeMemoise;
    }

    body.push(
      ...buildMutatorMapAssign({
        MUTATOR_MAP_REF: getMutatorId(),
        KEY: key,
        VALUE: getValue(prop),
        KIND: t.identifier(prop.kind),
      }),
    );
  }

  function pushComputedPropsLoose(info) {
    for (const prop of info.computedProps) {
      if (prop.kind === "get" || prop.kind === "set") {
        pushMutatorDefine(info, prop);
      } else {
        pushAssign(info, prop, info.body);
      }
    }
  }

  function toDefinePropertyCall(propNode, definedObject, state) {
    const defineProperty = state.addHelper("defineProperty");
    state.set("defineProperty", defineProperty);
    return t.callExpression(defineProperty, [
      definedObject,
      t.toComputedKey(propNode),
      getValue(propNode),
    ]);
  }

  function canWrapPrevious(body, state) {
    const previous = body[body.length - 1];

    if (
      t.isObjectExpression(previous) ||
      (t.isCallExpression(previous) &&
        t.isNodesEquivalent(previous.callee, state.get("defineProperty")))
    ) {
      return true;
    }

    return false;
  }

  function pushComputedPropsSpec(info) {
    const { getObjId, body, computedProps, state } = info;

    for (const prop of computedProps) {
      const key = t.toComputedKey(prop);

      if (prop.kind === "get" || prop.kind === "set") {
        pushMutatorDefine(info, prop);
      } else if (t.isStringLiteral(key, { value: "__proto__" })) {
        pushAssign(info, prop, body);
      } else {
        if (canWrapPrevious(body, state)) {
          const previous = body[body.length - 1];
          body[body.length - 1] = toDefinePropertyCall(prop, previous, state);
        } else {
          body.push(toDefinePropertyCall(prop, getObjId(), state));
        }
      }
    }
  }

  return {
    visitor: {
      ObjectExpression: {
        exit(path, state) {
          const { node, parent, scope } = path;
          let hasComputed = false;
          for (const prop of (node.properties: Array<Object>)) {
            hasComputed = prop.computed === true;
            if (hasComputed) break;
          }
          if (!hasComputed) return;

          const body = [];

          let needObjectRef = false;
          let objId = null;
          const getObjId = () => objId;

          const deoptObjRef = () => {
            if (needObjectRef) {
              return;
            }
            needObjectRef = true;
            objId = scope.generateUidIdentifierBasedOnNode(parent);
            body[0] = t.variableDeclaration("var", [
              t.variableDeclarator(objId, body[0]),
            ]);
          };

          // put all getters/setters into the first object expression as well as all initialisers up
          // to the first computed property

          const initProps = [];
          const computedProps = [];
          let foundComputed = false;

          for (const prop of node.properties) {
            if (prop.computed) {
              foundComputed = true;
            }

            if (foundComputed) {
              computedProps.push(prop);
            } else {
              initProps.push(prop);
            }
          }

          body.push(t.objectExpression(initProps));

          let mutatorRef;

          const getMutatorId = function() {
            if (!mutatorRef) {
              deoptObjRef();
              mutatorRef = scope.generateUidIdentifier("mutatorMap");

              body.push(
                t.variableDeclaration("var", [
                  t.variableDeclarator(mutatorRef, t.objectExpression([])),
                ]),
              );
            }

            return mutatorRef;
          };

          pushComputedProps({
            scope,
            getObjId,
            body,
            computedProps,
            getMutatorId,
            deoptObjRef,
            state,
          });

          if (mutatorRef) {
            body.push(
              t.expressionStatement(
                t.callExpression(
                  state.addHelper("defineEnumerableProperties"),
                  [objId, mutatorRef],
                ),
              ),
            );
          }

          if (body.length === 1) {
            path.replaceWith(body[0]);
          } else {
            if (needObjectRef) {
              body.push(t.expressionStatement(objId));
            }
            path.replaceWithMultiple(body);
          }
        },
      },
    },
  };
}
