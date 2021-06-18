import { types as t } from "@babel/core";
import {
  pushPrivateName,
  buildPrivateInstanceFieldInitSpec,
  buildPrivateStaticFieldInitSpec,
  buildPrivateInstanceMethodInitSpec,
  transformPrivateNamesUsage,
  buildPrivateFieldInitLoose,
  buildPrivateMethodInitLoose,
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
import { map, mapFilter } from "../utils/fp";

export default function classElementsToES6(api) {
  const constantSuper = api.assumption("constantSuper");
  const noDocumentAll = api.assumption("noDocumentAll");
  const privateFieldsAsProperties = api.assumption("privateFieldsAsProperties");

  const ifPFAP = fn => {
    return privateFieldsAsProperties ? fn() : [];
  };

  const buildPrivateInstanceFieldInit = privateFieldsAsProperties
    ? buildPrivateFieldInitLoose
    : buildPrivateInstanceFieldInitSpec;
  const buildPrivateStaticFieldInit = privateFieldsAsProperties
    ? buildPrivateFieldInitLoose
    : buildPrivateStaticFieldInitSpec;

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
      const getExternalClassRefForUsage = () => {
        needsClassRef = true;
        return t.cloneNode(getExternalClassRef());
      };

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

      const initInstanceFields = map(node => {
        if (t.isPrivate(node)) {
          return buildPrivateInstanceFieldInit(
            node,
            path.scope,
            privateNamesMap,
          );
        } else {
          return buildPublicFieldInitSpec(t.thisExpression(), node, state);
        }
      });
      const initStaticFields = mapFilter(node => {
        if (t.isPrivate(node)) {
          return buildPrivateStaticFieldInit(
            node,
            path.scope,
            privateNamesMap,
            getExternalClassRefForUsage,
          );
        } else {
          return buildPublicFieldInitSpec(
            getExternalClassRefForUsage(),
            node,
            state,
          );
        }
      });
      const initPrivMethods = privateFieldsAsProperties
        ? (nodes, getClassRef) =>
            mapFilter(node =>
              buildPrivateMethodInitLoose(
                node,
                path.scope,
                privateNamesMap,
                getClassRef,
              ),
            )(nodes)
        : mapFilter(node =>
            buildPrivateInstanceMethodInitSpec(
              node,
              path.scope,
              privateNamesMap,
            ),
          );

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
        [
          ...ifPFAP(() =>
            initPrivMethods(staticPrivMethods, getExternalClassRefForUsage),
          ),
          ...initStaticFields(staticFields),
        ].map(n => t.expressionStatement(n)),
        getExternalClassRef(),
        needsClassRef,
      );

      eltsToRemove.forEach(el => el.remove());
    },
  };
}
