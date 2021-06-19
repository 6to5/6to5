import { types as t } from "@babel/core";
import {
  pushPrivateName,
  buildPrivateInstanceFieldInitSpec,
  buildPrivateStaticFieldInitSpec,
  buildPrivateInstanceMethodInitSpec,
  buildPrivateFieldInitLoose,
  buildPrivateMethodInitLoose,
  transformPrivateNamesUsage,
} from "../utils/private";
import {
  injectInitialization,
  injectPureStatics,
  injectStaticInitialization,
} from "../utils/misc";
import {
  getClassRefs,
  replaceInnerBindingReferences,
  replaceSupers,
  replaceThisContextInExtractedNodes,
} from "../utils/context";
import { map, mapFilter } from "../utils/fp";

function unshiftFieldInit(fieldPath, exprs) {
  if (exprs.length === 0) return;

  if (fieldPath.node.value) {
    fieldPath.get("value").insertBefore(exprs);
  } else {
    fieldPath.set(
      "value",
      t.unaryExpression(
        "void",
        exprs.length > 1 ? t.sequenceExpression(exprs) : exprs[0],
      ),
    );
  }
}

export default function privateToFields(api) {
  const constantSuper = api.assumption("constantSuper");
  const noDocumentAll = api.assumption("noDocumentAll");
  const privateFieldsAsProperties = api.assumption("privateFieldsAsProperties");

  const ifPFAP = fn => {
    return privateFieldsAsProperties ? fn() : [];
  };

  const buildPrivateInstanceFieldInit = privateFieldsAsProperties
    ? buildPrivateFieldInitLoose
    : buildPrivateInstanceFieldInitSpec;

  return {
    Class(path, state) {
      const privateNamesMap = new Map();

      const initInstancePrivFields = map(node =>
        buildPrivateInstanceFieldInit(node, path.scope, privateNamesMap),
      );
      const initStaticPrivFields = privateFieldsAsProperties
        ? (nodes, getClassRef) =>
            nodes.map(node =>
              buildPrivateFieldInitLoose(
                node,
                path.scope,
                privateNamesMap,
                getClassRef,
              ),
            )
        : mapFilter(node =>
            buildPrivateStaticFieldInitSpec(node, path.scope, privateNamesMap),
          );
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
              state,
            ),
          );

      const instanceMeta = {
        firstPrivFields: null,
        privFields: [],
        privMethods: [],
        firstPublicFieldPath: null,
        initPrivFields: initInstancePrivFields,
      };
      const staticMeta = {
        firstPrivFields: null,
        privFields: [],
        privMethods: [],
        firstPublicFieldPath: null,
        initPrivFields: initStaticPrivFields,
      };

      const eltsToRemove = [];
      let constructorPath;

      const {
        internalClassRef,
        getExternalClassRef,
        differentRefs,
        needsExternalClassRef,
      } = getClassRefs(path);

      for (const el of path.get("body.body")) {
        if (el.isPrivate()) {
          pushPrivateName(privateNamesMap, el);
        }

        const meta = el.node.static ? staticMeta : instanceMeta;

        if (el.isClassPrivateProperty()) {
          meta.privFields.push(el.node);
          eltsToRemove.push(el);
          continue;
        }

        if (el.isClassPrivateMethod()) {
          meta.privMethods.push(el.node);

          replaceSupers(path, el, state, constantSuper);
          if (differentRefs) {
            replaceInnerBindingReferences(
              el,
              getExternalClassRef,
              internalClassRef,
            );
          }

          eltsToRemove.push(el);
          continue;
        }

        if (el.isClassProperty()) {
          if (!meta.firstPublicFieldPath) {
            meta.firstPublicFieldPath = el;
            meta.firstPrivFields = meta.privFields;
            meta.privFields = [];
          } else {
            unshiftFieldInit(el, meta.initPrivFields(meta.privFields));
            meta.privFields = [];
          }
          continue;
        }

        if (el.isClassMethod({ kind: "constructor" })) {
          constructorPath = el;
        }
      }

      transformPrivateNamesUsage(
        internalClassRef,
        path,
        privateNamesMap,
        { privateFieldsAsProperties, noDocumentAll },
        state,
      );

      let instanceInit;
      if (instanceMeta.firstPublicFieldPath) {
        unshiftFieldInit(instanceMeta.firstPublicFieldPath, [
          ...initPrivMethods(instanceMeta.privMethods),
          ...initInstancePrivFields(instanceMeta.firstPrivFields),
        ]);
        instanceInit = initInstancePrivFields(instanceMeta.privFields);
      } else {
        instanceInit = [
          ...initPrivMethods(instanceMeta.privMethods),
          ...initInstancePrivFields(instanceMeta.privFields),
        ];
      }

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
        instancePrivMethods: instanceMeta.privMethods,
        staticPrivMethods: staticMeta.privMethods,
        privateFieldsAsProperties,
      });

      replaceThisContextInExtractedNodes(
        staticMeta.privFields,
        eltsToRemove,
        path,
        getExternalClassRef,
        internalClassRef,
        state,
        constantSuper,
      );

      if (staticMeta.firstPublicFieldPath) {
        unshiftFieldInit(staticMeta.firstPublicFieldPath, [
          ...ifPFAP(() => initPrivMethods(staticMeta.privMethods)),
          ...initStaticPrivFields(staticMeta.firstPrivFields),
        ]);
      }

      injectStaticInitialization(
        path,
        [
          ...ifPFAP(() =>
            initPrivMethods(staticMeta.privMethods, getExternalClassRef),
          ),
          ...initStaticPrivFields(staticMeta.privFields, getExternalClassRef),
        ],
        getExternalClassRef,
        needsExternalClassRef(),
      );

      eltsToRemove.forEach(el => el.remove());
    },
  };
}
