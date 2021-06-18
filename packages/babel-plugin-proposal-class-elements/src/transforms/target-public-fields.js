import { types as t } from "@babel/core";
import {
  pushPrivateName,
  buildPrivateInstanceFieldInitSpec,
  buildPrivateStaticFieldInitSpec,
  buildPrivateInstanceMethodInitSpec,
  transformPrivateNamesUsage,
} from "../utils/private";
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

  return {
    Class(path, state) {
      const privateNamesMap = new Map();

      const initInstancePrivFields = nodes =>
        nodes.map(node =>
          buildPrivateInstanceFieldInitSpec(
            t.thisExpression(),
            node,
            path.scope,
            privateNamesMap,
          ),
        );
      const initStaticPrivFields = nodes =>
        nodes
          .map(node =>
            buildPrivateStaticFieldInitSpec(node, path.scope, privateNamesMap),
          )
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
          needsClassRef =
            replaceInnerBindingReferences(
              el,
              getExternalClassRef(),
              classRef,
            ) || needsClassRef;

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
        classRef,
        path,
        privateNamesMap,
        { privateFieldsAsProperties, noDocumentAll },
        state,
      );

      if (instanceMeta.firstPublicFieldPath) {
        unshiftFieldInit(instanceMeta.firstPublicFieldPath, [
          ...initPrivMethods(instanceMeta.privMethods),
          ...initInstancePrivFields(instanceMeta.firstPrivFields),
        ]);
        instanceMeta.privFields = initInstancePrivFields(
          instanceMeta.privFields,
        );
      } else {
        instanceMeta.privFields = [
          ...initPrivMethods(instanceMeta.privMethods),
          ...initInstancePrivFields(instanceMeta.privFields),
        ];
      }

      if (staticMeta.firstPublicFieldPath) {
        unshiftFieldInit(
          staticMeta.firstPublicFieldPath,
          initStaticPrivFields(staticMeta.firstPrivFields),
        );
      }

      if (instanceMeta.privFields.length > 0) {
        injectInitialization(
          path,
          constructorPath,
          instanceMeta.privFields.map(p => t.expressionStatement(p)),
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

      needsClassRef =
        replaceThisContextInExtractedNodes(
          staticMeta.privFields,
          eltsToRemove,
          path,
          getExternalClassRef(),
          originalClassRef,
          state,
          constantSuper,
        ) || needsClassRef;

      injectStaticInitialization(
        path,
        initStaticPrivFields(staticMeta.privFields),
        getExternalClassRef(),
        needsClassRef,
      );

      eltsToRemove.forEach(el => el.remove());
    },
  };
}
