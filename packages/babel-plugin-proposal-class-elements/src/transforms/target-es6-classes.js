import { types as t } from "@babel/core";
import {
  pushPrivateName,
  buildPrivateInstanceFieldInitSpec,
  buildPrivateStaticFieldInitSpec,
  buildPrivateInstanceMethodInitSpec,
  transformPrivateNamesUsage,
} from "../utils/private";
import { buildPublicFieldInitSpec } from "../utils/public";
import {
  injectInitialization,
  injectPureStatics,
  injectStaticInitialization,
} from "../utils/misc";
import {
  ensureClassRef,
  ensureExternalClassRef,
  replaceInnerBindingReferences,
  replaceSupers,
  replaceThisContextInExtractedNodes,
} from "../utils/context";

export default function classElementsToES6(api) {
  const constantSuper = api.assumption("constantSuper");
  const noDocumentAll = api.assumption("noDocumentAll");
  const privateFieldsAsProperties = api.assumption("privateFieldsAsProperties");

  return {
    Class(path, state) {
      const privateNamesMap = new Map();

      const eltsToRemove = [];
      const instanceFields = [];
      const staticFields = [];
      const instancePrivMethods = [];
      const staticPrivMethods = [];
      let constructorPath;

      const { classRef, originalClassRef } = ensureClassRef(path);
      let needsClassRef = false;
      let externalClassRef;
      const getExternalClassRef = () =>
        (externalClassRef ||= ensureExternalClassRef(
          path,
          classRef,
          originalClassRef,
        ));

      for (const el of path.get("body.body")) {
        const isStatic = el.node.static;
        if (el.isPrivate()) {
          pushPrivateName(privateNamesMap, el);
        }

        if (el.isClassPrivateProperty() || el.isClassProperty()) {
          (isStatic ? staticFields : instanceFields).push(el.node);
          eltsToRemove.push(el);
          continue;
        }

        if (el.isClassPrivateMethod()) {
          (isStatic ? staticPrivMethods : instancePrivMethods).push(el.node);

          replaceSupers(path, el, state, constantSuper);
          needsClassRef =
            replaceInnerBindingReferences(
              el,
              getExternalClassRef(),
              classRef,
            ) || needsClassRef;

          eltsToRemove.push(el);
          continue;
        }

        if (el.isClassMethod({ kind: "constructor" })) {
          constructorPath = el;
        }
      }

      transformPrivateNamesUsage(
        classRef,
        path,
        privateNamesMap,
        { privateFieldsAsProperties, noDocumentAll },
        state,
      );

      needsClassRef =
        replaceThisContextInExtractedNodes(
          staticFields,
          eltsToRemove,
          path,
          getExternalClassRef(),
          originalClassRef,
          state,
          constantSuper,
        ) || needsClassRef;

      const initInstanceFields = nodes =>
        nodes.map(node => {
          if (t.isPrivate(node)) {
            return buildPrivateInstanceFieldInitSpec(
              t.thisExpression(),
              node,
              path.scope,
              privateNamesMap,
            );
          } else {
            return buildPublicFieldInitSpec(t.thisExpression(), node, state);
          }
        });
      const initStaticFields = nodes =>
        nodes
          .map(node => {
            if (t.isPrivate(node)) {
              return buildPrivateStaticFieldInitSpec(
                node,
                path.scope,
                privateNamesMap,
              );
            } else {
              needsClassRef = true;
              return buildPublicFieldInitSpec(
                getExternalClassRef(),
                node,
                state,
              );
            }
          })
          .filter(Boolean);
      const initPrivMethods = nodes =>
        nodes
          .map(node =>
            buildPrivateInstanceMethodInitSpec(
              t.thisExpression(),
              node,
              path.scope,
              privateNamesMap,
              state,
            ),
          )
          .filter(Boolean);

      const instanceInit = [
        ...initPrivMethods(instancePrivMethods),
        ...initInstanceFields(instanceFields),
      ];
      if (instanceInit.length > 0) {
        injectInitialization(
          path,
          constructorPath,
          instanceInit.map(p => t.expressionStatement(p)),
        );
      }

      injectPureStatics({
        state,
        path,
        privateNamesMap,
        instancePrivMethods,
        staticPrivMethods,
        privateFieldsAsProperties,
      });

      injectStaticInitialization(
        path,
        initStaticFields(staticFields).map(n => t.expressionStatement(n)),
        getExternalClassRef(),
        needsClassRef,
      );

      eltsToRemove.forEach(el => el.remove());
    },
  };
}
