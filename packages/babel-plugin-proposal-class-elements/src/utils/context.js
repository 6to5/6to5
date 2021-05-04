import { types as t, traverse } from "@babel/core";
import ReplaceSupers, {
  environmentVisitor,
} from "@babel/helper-replace-supers";

export function replaceThisContext(
  classPath,
  fieldPath,
  ref,
  file,
  constantSuper,
) {
  replaceSupers(classPath, fieldPath, file, constantSuper);

  const state = { classRef: ref, needsClassRef: false };
  fieldPath.traverse(thisContextVisitor, state);

  return state.needsClassRef;
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
      state.needsClassRef = true;
      path.replaceWith(t.cloneNode(state.classRef));
    },
  },
  environmentVisitor,
]);

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
