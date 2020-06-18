// Fork of https://github.com/loganfsmyth/babel-plugin-proposal-decorators-legacy

import { template, types as t } from "@babel/core";

const buildClassDecorator = template(`
  DECORATOR(CLASS_REF = INNER) || CLASS_REF;
`);

const buildClassPrototype = template(`
  CLASS_REF.prototype;
`);

const buildGetDescriptor = template(`
    Object.getOwnPropertyDescriptor(TARGET, PROPERTY);
`);

const buildGetObjectInitializer = template(`
    (TEMP = Object.getOwnPropertyDescriptor(TARGET, PROPERTY), (TEMP = TEMP ? TEMP.value : undefined), {
        enumerable: true,
        configurable: true,
        writable: true,
        initializer: function(){
            return TEMP;
        }
    })
`);

const WARNING_CALLS = new WeakSet();

/**
 * If the decorator expressions are non-identifiers, hoist them to before the class so we can be sure
 * that they are evaluated in order.
 */
function applyEnsureOrdering(path) {
  // TODO: This should probably also hoist computed properties.
  const decorators = (path.isClass()
    ? [path].concat(path.get("body.body"))
    : path.get("properties")
  ).reduce((acc, prop) => acc.concat(prop.node.decorators || []), []);

  const identDecorators = decorators.filter(
    decorator => !t.isIdentifier(decorator.expression),
  );
  if (identDecorators.length === 0) return;

  return t.sequenceExpression(
    identDecorators
      .map(decorator => {
        const expression = decorator.expression;
        const id = (decorator.expression = path.scope.generateDeclaredUidIdentifier(
          "dec",
        ));
        return t.assignmentExpression("=", id, expression);
      })
      .concat([path.node]),
  );
}

/**
 * Given a class expression with class-level decorators, create a new expression
 * with the proper decorated behavior.
 */
function applyClassDecorators(classPath) {
  if (!hasClassDecorators(classPath.node)) return;

  const decorators = classPath.node.decorators || [];
  classPath.node.decorators = null;

  const name = classPath.scope.generateDeclaredUidIdentifier("class");

  return decorators
    .map(dec => dec.expression)
    .reverse()
    .reduce(function (acc, decorator) {
      return buildClassDecorator({
        CLASS_REF: t.cloneNode(name),
        DECORATOR: t.cloneNode(decorator),
        INNER: acc,
      }).expression;
    }, classPath.node);
}

function hasClassDecorators(classNode) {
  return !!(classNode.decorators && classNode.decorators.length);
}

/**
 * Given a class expression with method-level decorators, create a new expression
 * with the proper decorated behavior.
 */
function applyMethodDecorators(path, state) {
  if (!hasMethodDecorators(path.node.body.body)) return;

  return applyTargetDecorators(path, state, path.node.body.body);
}

function hasMethodDecorators(body) {
  return body.some(node => node.decorators?.length);
}

/**
 * Given an object expression with property decorators, create a new expression
 * with the proper decorated behavior.
 */
function applyObjectDecorators(path, state) {
  if (!hasMethodDecorators(path.node.properties)) return;

  return applyTargetDecorators(path, state, path.node.properties);
}

/**
 * A helper to pull out property decorators into a sequence expression.
 */
function applyTargetDecorators(path, state, decoratedProps) {
  const name = path.scope.generateDeclaredUidIdentifier(
    path.isClass() ? "class" : "obj",
  );

  const exprs = decoratedProps.reduce(function (acc, node) {
    const decorators = node.decorators || [];
    node.decorators = null;

    if (decorators.length === 0) return acc;

    if (node.computed) {
      throw path.buildCodeFrameError(
        "Computed method/property decorators are not yet supported.",
      );
    }

    const property = t.isLiteral(node.key)
      ? node.key
      : t.stringLiteral(node.key.name);

    const target =
      path.isClass() && !node.static
        ? buildClassPrototype({
            CLASS_REF: name,
          }).expression
        : name;

    if (t.isClassProperty(node, { static: false })) {
      const descriptor = path.scope.generateDeclaredUidIdentifier("descriptor");

      const initializer = node.value
        ? t.functionExpression(
            null,
            [],
            t.blockStatement([t.returnStatement(node.value)]),
          )
        : t.nullLiteral();

      node.value = t.callExpression(
        state.addHelper("initializerWarningHelper"),
        [descriptor, t.thisExpression()],
      );

      WARNING_CALLS.add(node.value);

      acc = acc.concat([
        t.assignmentExpression(
          "=",
          descriptor,
          t.callExpression(state.addHelper("applyDecoratedDescriptor"), [
            t.cloneNode(target),
            t.cloneNode(property),
            t.arrayExpression(
              decorators.map(dec => t.cloneNode(dec.expression)),
            ),
            t.objectExpression([
              t.objectProperty(
                t.identifier("configurable"),
                t.booleanLiteral(true),
              ),
              t.objectProperty(
                t.identifier("enumerable"),
                t.booleanLiteral(true),
              ),
              t.objectProperty(
                t.identifier("writable"),
                t.booleanLiteral(true),
              ),
              t.objectProperty(t.identifier("initializer"), initializer),
            ]),
          ]),
        ),
      ]);
    } else {
      acc = acc.concat(
        t.callExpression(state.addHelper("applyDecoratedDescriptor"), [
          t.cloneNode(target),
          t.cloneNode(property),
          t.arrayExpression(decorators.map(dec => t.cloneNode(dec.expression))),
          t.isObjectProperty(node) || t.isClassProperty(node, { static: true })
            ? buildGetObjectInitializer({
                TEMP: path.scope.generateDeclaredUidIdentifier("init"),
                TARGET: t.cloneNode(target),
                PROPERTY: t.cloneNode(property),
              }).expression
            : buildGetDescriptor({
                TARGET: t.cloneNode(target),
                PROPERTY: t.cloneNode(property),
              }).expression,
          t.cloneNode(target),
        ]),
      );
    }

    return acc;
  }, []);

  return t.sequenceExpression([
    t.assignmentExpression("=", t.cloneNode(name), path.node),
    t.sequenceExpression(exprs),
    t.cloneNode(name),
  ]);
}

function decoratedClassToExpression({ node, scope }) {
  if (!hasClassDecorators(node) && !hasMethodDecorators(node.body.body)) {
    return;
  }

  const ref = node.id
    ? t.cloneNode(node.id)
    : scope.generateUidIdentifier("class");

  return t.variableDeclaration("let", [
    t.variableDeclarator(ref, t.toExpression(node)),
  ]);
}

export default {
  ExportDefaultDeclaration(path) {
    const decl = path.get("declaration");
    if (!decl.isClassDeclaration()) return;

    const replacement = decoratedClassToExpression(decl);
    if (replacement) {
      const [varDeclPath] = path.replaceWithMultiple([
        replacement,
        t.exportNamedDeclaration(null, [
          t.exportSpecifier(
            t.cloneNode(replacement.declarations[0].id),
            t.identifier("default"),
          ),
        ]),
      ]);

      if (!decl.node.id) {
        path.scope.registerDeclaration(varDeclPath);
      }
    }
  },
  ClassDeclaration(path) {
    const replacement = decoratedClassToExpression(path);
    if (replacement) {
      path.replaceWith(replacement);

      const decl = path.get("declarations.0");
      const { id } = decl.node;

      // TODO: Maybe add this logic to @babel/traverse
      const binding = path.scope.getOwnBinding(id.name);
      binding.identifier = id;
      binding.path = decl;
    }
  },
  ClassExpression(path, state) {
    // Create a replacement for the class node if there is one. We do one pass to replace classes with
    // class decorators, and a second pass to process method decorators.
    const decoratedClass =
      applyEnsureOrdering(path) ||
      applyClassDecorators(path, state) ||
      applyMethodDecorators(path, state);

    if (decoratedClass) path.replaceWith(decoratedClass);
  },
  ObjectExpression(path, state) {
    const decoratedObject =
      applyEnsureOrdering(path) || applyObjectDecorators(path, state);

    if (decoratedObject) path.replaceWith(decoratedObject);
  },

  AssignmentExpression(path, state) {
    if (!WARNING_CALLS.has(path.node.right)) return;

    path.replaceWith(
      t.callExpression(state.addHelper("initializerDefineProperty"), [
        t.cloneNode(path.get("left.object").node),
        t.stringLiteral(
          path.get("left.property").node.name ||
            path.get("left.property").node.value,
        ),
        t.cloneNode(path.get("right.arguments")[0].node),
        t.cloneNode(path.get("right.arguments")[1].node),
      ]),
    );
  },

  CallExpression(path, state) {
    if (path.node.arguments.length !== 3) return;
    if (!WARNING_CALLS.has(path.node.arguments[2])) return;

    // If the class properties plugin isn't enabled, this line will add an unused helper
    // to the code. It's not ideal, but it's ok since the configuration is not valid anyway.
    if (path.node.callee.name !== state.addHelper("defineProperty").name) {
      return;
    }

    path.replaceWith(
      t.callExpression(state.addHelper("initializerDefineProperty"), [
        t.cloneNode(path.get("arguments")[0].node),
        t.cloneNode(path.get("arguments")[1].node),
        t.cloneNode(path.get("arguments.2.arguments")[0].node),
        t.cloneNode(path.get("arguments.2.arguments")[1].node),
      ]),
    );
  },
};
