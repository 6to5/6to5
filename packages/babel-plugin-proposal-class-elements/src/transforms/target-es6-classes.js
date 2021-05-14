import { types as t } from "@babel/core";
import {
  pushPrivateName,
  buildPrivateNamesNodes,
  buildPrivateInstanceFieldInitSpec,
  buildPrivateStaticFieldInitSpec,
  buildPrivateInstanceMethodInitSpec,
  buildPrivateMethodDeclaration,
  transformPrivateNamesUsage,
} from "../utils/private";
import { buildPublicFieldInitSpec } from "../utils/public";
import { injectInitialization } from "../utils/misc";
import { replaceSupers, replaceThisContext } from "../utils/context";

export default function classElementsToES6(api) {
  const constantSuper = api.assumption("constantSuper");
  const noDocumentAll = api.assumption("noDocumentAll");
  const privateFieldsAsProperties = api.assumption("privateFieldsAsProperties");

  return {
    Class(path, state) {
      const privateNamesMap = new Map();

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
              return buildPublicFieldInitSpec(classRef, node, state);
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

      const eltsToRemove = [];
      const instanceFields = [];
      const staticFields = [];
      const instancePrivMethods = [];
      const staticPrivMethods = [];
      let constructorPath;

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
          eltsToRemove.push(el);
          continue;
        }

        if (el.isClassMethod({ kind: "constructor" })) {
          constructorPath = el;
        }
      }

      let classRef = path.node.id;
      if (!classRef) {
        path.set("id", (classRef = path.scope.generateUidIdentifier("class")));
      }

      const stmtParent = path.find(
        parent =>
          parent.isStatement() ||
          parent.isDeclaration() ||
          parent.parentPath.isArrowFunctionExpression({
            body: parent.node,
          }),
      );

      transformPrivateNamesUsage(
        classRef,
        path,
        privateNamesMap,
        { privateFieldsAsProperties, noDocumentAll },
        state,
      );

      for (let i = 0, j = 0; i < staticFields.length; i++) {
        while (staticFields[i] !== eltsToRemove[j].node) {
          j++;
          if (j > eltsToRemove.length) throw new Error("Internal Babel error");
        }

        replaceThisContext(
          path,
          eltsToRemove[j],
          classRef,
          state,
          constantSuper,
        );
      }

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

      const pureStaticNodesBefore = buildPrivateNamesNodes(
        privateNamesMap,
        privateFieldsAsProperties,
        state,
      );
      if (pureStaticNodesBefore) stmtParent.insertBefore(pureStaticNodesBefore);

      const pureStaticNodesAfter = instancePrivMethods
        .concat(staticPrivMethods)
        .map(method =>
          buildPrivateMethodDeclaration(
            method,
            privateNamesMap,
            privateFieldsAsProperties,
          ),
        );
      if (pureStaticNodesAfter.length > 0) {
        stmtParent.insertAfter(pureStaticNodesAfter);
      }

      const staticNodesAfter = initStaticFields(staticFields).map(n =>
        t.expressionStatement(n),
      );
      if (staticNodesAfter.length > 0) path.insertAfter(staticNodesAfter);

      eltsToRemove.forEach(el => el.remove());
    },
  };
}
