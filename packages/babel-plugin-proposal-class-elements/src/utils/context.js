import { types as t, traverse } from "@babel/core";
import ReplaceSupers, {
  environmentVisitor,
} from "@babel/helper-replace-supers";

export function getClassRefs(path) {
  const originalClassRef = path.node.id;
  let internalClassRef = originalClassRef;

  if (!internalClassRef) {
    internalClassRef = path.scope.generateUidIdentifier("class");
    path.set("id", internalClassRef);
  }

  // Different internal and external refs are only needed when we have a class
  // expression with an user-defined name.
  const differentRefs =
    internalClassRef === originalClassRef && path.isClassExpression();

  let externalClassRef;

  return {
    internalClassRef,
    differentRefs,
    getExternalClassRef() {
      externalClassRef ||= differentRefs
        ? path.scope.generateUidIdentifier(internalClassRef.name)
        : internalClassRef;

      return t.cloneNode(externalClassRef);
    },
    needsExternalClassRef() {
      return !!externalClassRef;
    },
  };
}

export function replaceThisContextInExtractedNodes(
  nodes,
  extractedPaths,
  path,
  getExternalClassRef,
  internalClassRef,
  state,
  constantSuper,
) {
  for (let i = 0, j = 0; i < nodes.length; i++) {
    while (nodes[i] !== extractedPaths[j].node) {
      j++;
      if (j > extractedPaths.length) {
        throw new Error("Internal Babel error");
      }
    }

    replaceThisContext(
      path,
      extractedPaths[j],
      getExternalClassRef,
      state,
      constantSuper,
      internalClassRef,
    );
  }
}

export function replaceThisContext(
  classPath,
  fieldPath,
  getExternalClassRef,
  file,
  constantSuper,
  internalClassRef,
) {
  replaceSupers(classPath, fieldPath, file, constantSuper);

  fieldPath.traverse(thisContextVisitor, { getExternalClassRef });

  replaceInnerBindingReferences(
    fieldPath,
    getExternalClassRef,
    internalClassRef,
  );
}

export function replaceInnerBindingReferences(
  elemPath,
  getExternalClassRef,
  internalClassRef,
) {
  elemPath.traverse(innerReferencesVisitor, {
    getExternalClassRef,
    internalClassRef,
  });
}

export function replaceSupers(classPath, elementPath, file, constantSuper) {
  if (!classPath.node.superClass) return;

  new ReplaceSupers({
    methodPath: elementPath,
    constantSuper,
    superRef: classPath.node.superClass,
    file,
    getObjectRef() {
      let { id } = classPath.node;
      if (!id) {
        id = classPath.scope.generateUidIdentifier();
        classPath.set("id", id);
      }
      id = t.cloneNode(id);

      return elementPath.node.static
        ? id
        : t.memberExpression(id, t.identifier("prototype"));
    },
  }).replace();
}

const thisContextVisitor = traverse.visitors.merge([
  {
    ThisExpression(path, state) {
      path.replaceWith(state.getExternalClassRef());
    },
  },
  environmentVisitor,
]);

const innerReferencesVisitor = {
  ReferencedIdentifier(path, state) {
    if (
      path.scope.bindingIdentifierEquals(path.node.name, state.internalClassRef)
    ) {
      path.replaceWith(state.getExternalClassRef());
      path.skip();
    }
  },
};

export const findBareSupers = traverse.visitors.merge([
  {
    Super(path) {
      const { node, parentPath } = path;
      if (parentPath.isCallExpression({ callee: node })) {
        this.push(parentPath);
      }
    },
  },
  environmentVisitor,
]);
