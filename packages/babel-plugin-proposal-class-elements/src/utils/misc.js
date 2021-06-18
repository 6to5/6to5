import { template, types as t } from "@babel/core";
import { findBareSupers } from "./context";
import {
  buildPrivateMethodDeclaration,
  buildPrivateNamesNodes,
} from "./private";

const referenceVisitor = {
  "TSTypeAnnotation|TypeAnnotation"(path) {
    path.skip();
  },

  ReferencedIdentifier(path) {
    if (this.scope.hasOwnBinding(path.node.name)) {
      this.scope.rename(path.node.name);
      path.skip();
    }
  },
};

export function injectInitialization(path, constructor, nodes, renamer) {
  if (!nodes.length) return;

  const isDerived = !!path.node.superClass;

  if (!constructor) {
    const newConstructor = t.classMethod(
      "constructor",
      t.identifier("constructor"),
      [],
      t.blockStatement([]),
    );

    if (isDerived) {
      newConstructor.params = [t.restElement(t.identifier("args"))];
      newConstructor.body.body.push(template.statement.ast`super(...args)`);
    }

    [constructor] = path.get("body").unshiftContainer("body", newConstructor);
  }

  if (renamer) {
    renamer(referenceVisitor, { scope: constructor.scope });
  }

  if (isDerived) {
    const bareSupers = [];
    constructor.traverse(findBareSupers, bareSupers);
    let isFirst = true;
    for (const bareSuper of bareSupers) {
      if (isFirst) {
        bareSuper.insertAfter(nodes);
        isFirst = false;
      } else {
        bareSuper.insertAfter(nodes.map(n => t.cloneNode(n)));
      }
    }
  } else {
    constructor.get("body").unshiftContainer("body", nodes);
  }
}

export function injectStaticInitialization(
  path,
  nodes,
  externalClassRef,
  needsClassRef,
) {
  if (path.isClassDeclaration()) {
    return path.insertAfter(nodes).slice(1);
  } else {
    const assignment = t.assignmentExpression(
      "=",
      t.cloneNode(externalClassRef),
      path.node,
    );
    if (nodes.length > 0) {
      const paths = path.replaceWithMultiple([
        assignment,
        ...nodes,
        t.cloneNode(externalClassRef),
      ]);
      path.scope.push({ id: externalClassRef });

      return paths.slice(1, -1);
    } else if (needsClassRef) {
      path.replaceWith(assignment);
      path.scope.push({ id: externalClassRef });

      return [];
    }
  }
}

export function injectPureStatics({
  state,
  path,
  privateNamesMap,
  instancePrivMethods,
  staticPrivMethods,
  privateFieldsAsProperties,
}) {
  const stmtParent = path.find(
    parent =>
      parent.isStatement() ||
      parent.isDeclaration() ||
      parent.parentPath.isArrowFunctionExpression({
        body: parent.node,
      }),
  );

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
}
