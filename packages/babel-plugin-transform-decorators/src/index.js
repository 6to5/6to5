// Fork of https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy

import template from "babel-template";
import syntaxDecorators from "babel-plugin-syntax-decorators";

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

const buildInitializerWarningHelper = template(`
    function NAME(descriptor, context){
        throw new Error(
          'Decorating class property failed. Please ensure that ' +
          'transform-class-properties is enabled.'
        );
    }
`);

const buildInitializerDefineProperty = template(`
    function NAME(target, property, descriptor, context){
        if (!descriptor) return;

        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0,
        });
    }
`);

const buildApplyDecoratedDescriptor = template(`
    function NAME(target, property, decorators, descriptor, context){
        var desc = {};
        Object['ke' + 'ys'](descriptor).forEach(function(key){
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;
        if ('value' in desc || desc.initializer){
            desc.writable = true;
        }

        desc = decorators.slice().reverse().reduce(function(desc, decorator){
            return decorator(target, property, desc) || desc;
        }, desc);

        if (context && desc.initializer !== void 0){
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0){
            // This is a hack to avoid this being processed by 'transform-runtime'.
            // See issue #9.
            Object['define' + 'Property'](target, property, desc);
            desc = null;
        }

        return desc;
    }
`);

export default function({ types: t }) {
  /**
   * Add a helper to take an initial descriptor, apply some decorators to it, and optionally
   * define the property.
   */
  function ensureApplyDecoratedDescriptorHelper(path, state) {
    if (!state.applyDecoratedDescriptor) {
      state.applyDecoratedDescriptor = path.scope.generateUidIdentifier(
        "applyDecoratedDescriptor",
      );
      const helper = buildApplyDecoratedDescriptor({
        NAME: state.applyDecoratedDescriptor,
      });
      path.scope.getProgramParent().path.unshiftContainer("body", helper);
    }

    return state.applyDecoratedDescriptor;
  }

  /**
   * Add a helper to call as a replacement for class property definition.
   */
  function ensureInitializerDefineProp(path, state) {
    if (!state.initializerDefineProp) {
      state.initializerDefineProp = path.scope.generateUidIdentifier(
        "initDefineProp",
      );
      const helper = buildInitializerDefineProperty({
        NAME: state.initializerDefineProp,
      });
      path.scope.getProgramParent().path.unshiftContainer("body", helper);
    }

    return state.initializerDefineProp;
  }

  /**
   * Add a helper that will throw a useful error if the transform fails to detect the class
   * property assignment, so users know something failed.
   */
  function ensureInitializerWarning(path, state) {
    if (!state.initializerWarningHelper) {
      state.initializerWarningHelper = path.scope.generateUidIdentifier(
        "initializerWarningHelper",
      );
      const helper = buildInitializerWarningHelper({
        NAME: state.initializerWarningHelper,
      });
      path.scope.getProgramParent().path.unshiftContainer("body", helper);
    }

    return state.initializerWarningHelper;
  }

  /**
   * If the decorator expressions are non-identifiers, hoist them to before the class so we can be sure
   * that they are evaluated in order.
   */
  function applyEnsureOrdering(path) {
    // TODO: This should probably also hoist computed properties.
    const decorators = (path.isClass()
      ? [path].concat(path.get("body.body"))
      : path.get("properties")).reduce(
      (acc, prop) => acc.concat(prop.node.decorators || []),
      [],
    );

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
    const decorators = classPath.node.decorators || [];
    classPath.node.decorators = null;

    if (decorators.length === 0) return;

    const name = classPath.scope.generateDeclaredUidIdentifier("class");

    return decorators
      .map(dec => dec.expression)
      .reverse()
      .reduce(function(acc, decorator) {
        return buildClassDecorator({
          CLASS_REF: name,
          DECORATOR: decorator,
          INNER: acc,
        }).expression;
      }, classPath.node);
  }

  /**
   * Given a class expression with method-level decorators, create a new expression
   * with the proper decorated behavior.
   */
  function applyMethodDecorators(path, state) {
    const hasMethodDecorators = path.node.body.body.some(function(node) {
      return (node.decorators || []).length > 0;
    });

    if (!hasMethodDecorators) return;

    return applyTargetDecorators(path, state, path.node.body.body);
  }

  /**
   * Given an object expression with property decorators, create a new expression
   * with the proper decorated behavior.
   */
  function applyObjectDecorators(path, state) {
    const hasMethodDecorators = path.node.properties.some(function(node) {
      return (node.decorators || []).length > 0;
    });

    if (!hasMethodDecorators) return;

    return applyTargetDecorators(path, state, path.node.properties);
  }

  /**
   * A helper to pull out property decorators into a sequence expression.
   */
  function applyTargetDecorators(path, state, decoratedProps) {
    const name = path.scope.generateDeclaredUidIdentifier(
      path.isClass() ? "class" : "obj",
    );

    const exprs = decoratedProps.reduce(function(acc, node) {
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
        const descriptor = path.scope.generateDeclaredUidIdentifier(
          "descriptor",
        );

        const initializer = node.value
          ? t.functionExpression(
              null,
              [],
              t.blockStatement([t.returnStatement(node.value)]),
            )
          : t.nullLiteral();
        node.value = t.callExpression(ensureInitializerWarning(path, state), [
          descriptor,
          t.thisExpression(),
        ]);

        acc = acc.concat([
          t.assignmentExpression(
            "=",
            descriptor,
            t.callExpression(
              ensureApplyDecoratedDescriptorHelper(path, state),
              [
                target,
                property,
                t.arrayExpression(decorators.map(dec => dec.expression)),
                t.objectExpression([
                  t.objectProperty(
                    t.identifier("enumerable"),
                    t.booleanLiteral(true),
                  ),
                  t.objectProperty(t.identifier("initializer"), initializer),
                ]),
              ],
            ),
          ),
        ]);
      } else {
        acc = acc.concat(
          t.callExpression(ensureApplyDecoratedDescriptorHelper(path, state), [
            target,
            property,
            t.arrayExpression(decorators.map(dec => dec.expression)),
            t.isObjectProperty(node) ||
            t.isClassProperty(node, { static: true })
              ? buildGetObjectInitializer({
                  TEMP: path.scope.generateDeclaredUidIdentifier("init"),
                  TARGET: target,
                  PROPERTY: property,
                }).expression
              : buildGetDescriptor({
                  TARGET: target,
                  PROPERTY: property,
                }).expression,
            target,
          ]),
        );
      }

      return acc;
    }, []);

    return t.sequenceExpression([
      t.assignmentExpression("=", name, path.node),
      t.sequenceExpression(exprs),
      name,
    ]);
  }

  return {
    inherits: syntaxDecorators,

    before: ["classProperties"],
    capabilities: ["decorators"],

    visitor: {
      ExportDefaultDeclaration(path) {
        if (!path.get("declaration").isClassDeclaration()) return;

        const { node } = path;
        const ref =
          node.declaration.id || path.scope.generateUidIdentifier("default");
        node.declaration.id = ref;

        // Split the class declaration and the export into two separate statements.
        path.replaceWith(node.declaration);
        path.insertAfter(
          t.exportNamedDeclaration(null, [
            t.exportSpecifier(ref, t.identifier("default")),
          ]),
        );
      },
      ClassDeclaration(path) {
        const { node } = path;

        const ref = node.id || path.scope.generateUidIdentifier("class");

        path.replaceWith(
          t.variableDeclaration("let", [
            t.variableDeclarator(ref, t.toExpression(node)),
          ]),
        );
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
        if (!state.initializerWarningHelper) return;

        if (!path.get("left").isMemberExpression()) return;
        if (!path.get("left.property").isIdentifier()) return;
        if (!path.get("right").isCallExpression()) return;
        if (
          !path
            .get("right.callee")
            .isIdentifier({ name: state.initializerWarningHelper.name })
        ) {
          return;
        }

        path.replaceWith(
          t.callExpression(ensureInitializerDefineProp(path, state), [
            path.get("left.object").node,
            t.stringLiteral(path.get("left.property").node.name),
            path.get("right.arguments")[0].node,
            path.get("right.arguments")[1].node,
          ]),
        );
      },
    },
  };
}
