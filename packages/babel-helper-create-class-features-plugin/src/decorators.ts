export function hasOwnDecorators(node) {
  return !!node.decorators?.length;
}

// TODO(Babel 8): Remove everything after this comment.

import { types as t, template } from "@babel/core";
import ReplaceSupers from "@babel/helper-replace-supers";
import nameFunction from "@babel/helper-function-name";

export function hasDecorators(node) {
  return hasOwnDecorators(node) || node.body.body.some(hasOwnDecorators);
}

function prop(key, value) {
  if (!value) return null;
  return t.objectProperty(t.identifier(key), value);
}

function method(key, body) {
  return t.objectMethod(
    "method",
    t.identifier(key),
    [],
    t.blockStatement(body),
  );
}

function takeDecorators(node) {
  let result;
  if (node.decorators && node.decorators.length > 0) {
    result = t.arrayExpression(
      node.decorators.map(decorator => decorator.expression),
    );
  }
  node.decorators = undefined;
  return result;
}

function getKey(node) {
  if (node.computed) {
    return node.key;
  } else if (t.isIdentifier(node.key)) {
    return t.stringLiteral(node.key.name);
  } else {
    return t.stringLiteral(String(node.key.value));
  }
}

// NOTE: This function can be easily bound as .bind(file, classRef, superRef)
//       to make it easier to use it in a loop.
function extractElementDescriptor(/* this: File, */ classRef, superRef, path) {
  const { node, scope } = path;
  const isMethod = path.isClassMethod();

  if (path.isPrivate()) {
    throw path.buildCodeFrameError(
      `Private ${
        isMethod ? "methods" : "fields"
      } in decorated classes are not supported yet.`,
    );
  }

  new ReplaceSupers({
    methodPath: path,
    objectRef: classRef,
    superRef,
    file: this,
    refToPreserve: classRef,
  }).replace();

  const properties: t.ObjectExpression["properties"] = [
    prop("kind", t.stringLiteral(isMethod ? node.kind : "field")),
    prop("decorators", takeDecorators(node)),
    prop("static", node.static && t.booleanLiteral(true)),
    prop("key", getKey(node)),
  ].filter(Boolean);

  if (isMethod) {
    const id = node.computed ? null : node.key;
    t.toExpression(node);
    properties.push(prop("value", nameFunction({ node, id, scope }) || node));
  } else if (node.value) {
    properties.push(
      method("value", template.statements.ast`return ${node.value}`),
    );
  } else {
    properties.push(prop("value", scope.buildUndefinedNode()));
  }

  path.remove();

  return t.objectExpression(properties);
}

function addDecorateHelper(file) {
  try {
    return file.addHelper("decorate");
  } catch (err) {
    if (err.code === "BABEL_HELPER_UNKNOWN") {
      err.message +=
        "\n  '@babel/plugin-transform-decorators' in non-legacy mode" +
        " requires '@babel/core' version ^7.0.2 and you appear to be using" +
        " an older version.";
    }
    throw err;
  }
}

export function buildDecoratedClass(ref, path, elements, file) {
  const { node, scope } = path;
  const initializeId = scope.generateUidIdentifier("initialize");
  const isDeclaration = node.id && path.isDeclaration();
  const isStrict = path.isInStrictMode();
  const { superClass } = node;

  node.type = "ClassDeclaration";
  if (!node.id) node.id = t.cloneNode(ref);

  let superId;
  if (superClass) {
    superId = scope.generateUidIdentifierBasedOnNode(node.superClass, "super");
    node.superClass = superId;
  }

  const classDecorators = takeDecorators(node);
  const definitions = t.arrayExpression(
    elements
      // Ignore TypeScript's abstract methods (see #10514)
      .filter(element => !element.node.abstract)
      .map(extractElementDescriptor.bind(file, node.id, superId)),
  );

  const wrapperCall = template.expression.ast`
    ${addDecorateHelper(file)}(
      ${classDecorators || t.nullLiteral()},
      function (${initializeId}, ${superClass ? t.cloneNode(superId) : null}) {
        ${node}
        return { F: ${t.cloneNode(node.id)}, d: ${definitions} };
      },
      ${superClass}
    )
  ` as t.CallExpression & { arguments: [unknown, t.FunctionExpression] };

  if (!isStrict) {
    wrapperCall.arguments[1].body.directives.push(
      t.directive(t.directiveLiteral("use strict")),
    );
  }

  let replacement: t.Node = wrapperCall;
  let classPathDesc = "arguments.1.body.body.0";
  if (isDeclaration) {
    replacement = template.statement.ast`let ${ref} = ${wrapperCall}`;
    classPathDesc = "declarations.0.init." + classPathDesc;
  }

  return {
    instanceNodes: [template.statement.ast`${t.cloneNode(initializeId)}(this)`],
    wrapClass(path) {
      path.replaceWith(replacement);
      return path.get(classPathDesc);
    },
  };
}
