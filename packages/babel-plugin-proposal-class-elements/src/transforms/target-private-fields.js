import { types as t, template, traverse } from "@babel/core";
import { environmentVisitor } from "@babel/helper-replace-supers";
import { replaceSupers } from "../utils/context";

function isKnownPrivate(node, names) {
  return (
    (t.isMemberExpression(node) || t.isOptionalMemberExpression(node)) &&
    t.isPrivateName(node.property) &&
    names.has(node.property.id.name)
  );
}

function toMemoizedFunction(node, scope, hint) {
  if (node.static) return t.toExpression(node);

  const tmpId = scope.generateUidIdentifier(hint);
  scope.push({ id: tmpId });

  return t.assignmentExpression(
    "||=",
    t.cloneNode(tmpId),
    t.toExpression(node),
  );
}

function hasSideEffects(path) {
  return !(path.isThisExpression() || path.isSuper() || path.isPure());
}

function readOnlyError(member, file) {
  return t.callExpression(file.addHelper("readOnlyError"), [
    t.stringLiteral(`#${member.property.id.name}`),
  ]);
}

const privateUsageVisitor = {
  AssignmentExpression(path, { methods, file }) {
    const { left, right } = path.node;
    if (isKnownPrivate(left, methods)) {
      const seq = [];

      if (hasSideEffects(path.get("left.object"))) seq.push(left.object);
      if (hasSideEffects(path.get("right"))) seq.push(right);
      seq.push(readOnlyError(left, file));

      path.replaceWith(t.sequenceExpression(seq));
    }
  },
  UpdateExpression(path, { methods, file }) {
    const { argument } = path.node;
    if (isKnownPrivate(argument, methods)) {
      const seq = [];

      if (hasSideEffects(path.get("argument.object"))) {
        seq.push(argument.object);
      }
      seq.push(readOnlyError(argument, file));

      path.replaceWith(t.sequenceExpression(seq));
    }
  },
  "MemberExpression|OptionalMemberExpression": {
    exit(path, { accessors }) {
      if (isKnownPrivate(path.node, accessors)) {
        path.replaceWith(
          path.type === "MemberExpression"
            ? t.memberExpression(path.node, t.identifier("_"))
            : t.optionalMemberExpression(
                path.node,
                t.identifier("_"),
                false,
                false,
              ),
        );
        path.skip();
      }
    },
  },

  // Don't transform usage of shadowed private names
  ClassBody(path, outerState) {
    const innerState = {
      ...outerState,
      methods: new Set(outerState.methods),
      accessors: new Set(outerState.accessors),
      rootClassBody: path.node,
    };

    for (const elt of path.get("body")) {
      if (elt.isPrivate()) {
        const { name } = elt.node.key.id;
        innerState.methods.delete(name);
        innerState.accessors.delete(name);
      }
    }

    path.traverse(privateUsageOuterEnvironmentVisitor, outerState);
    path.traverse(privateUsageInnerEnvironmentVisitor, innerState);

    path.skip();
  },
};

const privateUsageInnerEnvironmentVisitor = traverse.visitors.merge([
  {
    "Method|ClassProperty"(path, state) {
      if (path.parentPath.node === state.rootClassBody) path.skipKey("key");
    },
  },
  privateUsageVisitor,
]);

const privateUsageOuterEnvironmentVisitor = traverse.visitors.merge([
  environmentVisitor,
  privateUsageVisitor,
]);

const accessorThisUsageVisitor = traverse.visitors.merge([
  environmentVisitor,
  {
    ThisExpression(path) {
      path.replaceWith(template.expression.ast`this.t`);
      path.skip();
    },
  },
]);

export default function privateToFields(api) {
  const constantSuper = api.assumption("constantSuper");

  return {
    ClassBody(path, file) {
      const methods = new Map();
      const getters = new Map();
      const setters = new Map();
      const accessors = new Set();

      for (const element of path.get("body")) {
        if (element.isClassPrivateMethod()) {
          const { kind } = element.node;
          const { name } = element.node.key.id;

          if (kind === "method") {
            methods.set(name, element);
          } else if (kind === "get") {
            getters.set(name, element);
            accessors.add(name);
          } else if (kind === "set") {
            setters.set(name, element);
            accessors.add(name);
          }

          replaceSupers(path.parentPath, element, file, constantSuper);
        }
      }

      if (methods.size === 0 && accessors.size === 0) return;

      path.traverse(privateUsageInnerEnvironmentVisitor, {
        methods: new Set(methods.keys()),
        accessors,
        rootClassBody: path.node,
        file,
      });

      const newElements = [];

      for (const methodPath of methods.values()) {
        const { key, static: isStatic } = methodPath.node;

        newElements.push(
          t.classPrivateProperty(
            key,
            toMemoizedFunction(methodPath.node, path.scope, key.id.name),
            null,
            isStatic,
          ),
        );

        methodPath.remove();
      }

      for (const name of accessors) {
        const getter = getters.get(name);
        const setter = setters.get(name);

        getter?.traverse(accessorThisUsageVisitor);
        setter?.traverse(accessorThisUsageVisitor);

        const isStatic = (getter ?? setter).node.static;

        const descriptor = t.objectExpression([]);

        if (getter) {
          descriptor.properties.push(
            t.objectMethod(
              "get",
              t.identifier("_"),
              getter.node.params,
              getter.node.body,
            ),
          );
          getter.remove();
        } else {
          descriptor.properties.push(
            t.objectMethod(
              "get",
              t.identifier("_"),
              [],
              template.statement.ast`{
                ${file.addHelper("writeOnlyError")}(
                  ${t.stringLiteral(`#${name}`)}
                )
              }`,
            ),
          );
        }
        if (setter) {
          descriptor.properties.push(
            t.objectMethod(
              "set",
              t.identifier("_"),
              setter.node.params,
              setter.node.body,
            ),
          );
          setter.remove();
        } else {
          descriptor.properties.push(
            t.objectMethod(
              "set",
              t.identifier("_"),
              [t.identifier("_")],
              template.statement.ast`{
                ${file.addHelper("readOnlyError")}(
                  ${t.stringLiteral(`#${name}`)}
                )
              }`,
            ),
          );
        }

        let initializer;

        if (isStatic) {
          descriptor.properties.push(
            t.objectProperty(t.identifier("t"), t.thisExpression()),
          );
          initializer = descriptor;
        } else {
          const tmpId = path.scope.generateUidIdentifier(name);
          path.scope.push({ id: tmpId });

          initializer = template.expression.ast`
              {
                __proto__: ${t.cloneNode(tmpId)} ||= ${descriptor},
                t: this
              }
            `;
        }

        newElements.push(
          t.classPrivateProperty(
            t.privateName(t.identifier(name)),
            initializer,
            null,
            isStatic,
          ),
        );
      }

      path.unshiftContainer("body", newElements);
    },
  };
}
