/**
 * This adds a __self={this} JSX attribute to all JSX elements, which React will use
 * to generate some runtime warnings. However, if the JSX element appears within a
 * constructor of a derived class, `__self={this}` will not be inserted in order to
 * prevent runtime errors.
 *
 * == JSX Literals ==
 *
 * <sometag />
 *
 * becomes:
 *
 * <sometag __self={this} />
 */
import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";

const TRACE_ID = "__self";

/**
 * Finds the closest parent function that provides `this`. Specifically, this looks for
 * the first parent function that isn't an arrow function.
 *
 * Derived from `Scope#getFunctionParent`
 */
function getThisFunctionParent(path) {
  let scope = path.scope;
  do {
    if (
      scope.path.isFunctionParent() &&
      !scope.path.isArrowFunctionExpression()
    ) {
      return scope.path;
    }
  } while ((scope = scope.parent));
  return null;
}

/**
 * Returns whether the class has specified a superclass.
 */
function isDerivedClass(classPath) {
  return classPath.node.superClass !== null;
}

/**
 * Returns whether `this` is allowed at given path.
 */
function isThisAllowed(path) {
  // This specifically skips arrow functions as they do not rewrite `this`.
  const parentMethodOrFunction = getThisFunctionParent(path);
  if (parentMethodOrFunction === null) {
    // We are not in a method or function. It is fine to use `this`.
    return true;
  }
  if (!parentMethodOrFunction.isMethod()) {
    // If the closest parent is a regular function, `this` will be rebound, therefore it is fine to use `this`.
    return true;
  }
  // Current node is within a method, so we need to check if the method is a constructor.
  if (parentMethodOrFunction.node.kind !== "constructor") {
    // We are not in a constructor, therefore it is always fine to use `this`.
    return true;
  }
  // Now we are in a constructor. If it is a derived class, we do not reference `this`.
  return !isDerivedClass(parentMethodOrFunction.parentPath.parentPath);
}

export default declare(api => {
  api.assertVersion(7);

  const visitor = {
    JSXOpeningElement(path) {
      if (!isThisAllowed(path)) {
        return;
      }
      const node = path.node;
      const id = t.jsxIdentifier(TRACE_ID);
      const trace = t.thisExpression();

      node.attributes.push(t.jsxAttribute(id, t.jsxExpressionContainer(trace)));
    },
  };

  return {
    name: "transform-react-jsx-self",
    visitor: {
      Program(path) {
        path.traverse(visitor);
      },
    },
  };
});
