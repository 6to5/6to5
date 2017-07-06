import esutils from "esutils";
import * as t from "babel-types";

type ElementState = {
  tagExpr: Object, // tag node
  tagName: string, // raw string tag name
  args: Array<Object>, // array of call arguments
  call?: Object, // optional call property that can be set to override the call expression returned
  pre?: Function, // function called with (state: ElementState) before building attribs
  post?: Function, // function called with (state: ElementState) after building attribs
};

export default function(opts) {
  const visitor = {};

  visitor.JSXNamespacedName = function(path) {
    throw path.buildCodeFrameError(
      "Namespace tags are not supported. ReactJSX is not XML.",
    );
  };

  visitor.JSXElement = {
    exit(path, file) {
      const callExpr = buildElementCall(path.get("openingElement"), file);

      callExpr.arguments = callExpr.arguments.concat(path.node.children);

      if (callExpr.arguments.length >= 3) {
        callExpr._prettyCall = true;
      }

      path.replaceWith(t.inherits(callExpr, path.node));
    },
  };

  return visitor;

  function convertJSXIdentifier(node, parent) {
    if (t.isJSXIdentifier(node)) {
      if (node.name === "this" && t.isReferenced(node, parent)) {
        return t.thisExpression();
      } else if (esutils.keyword.isIdentifierNameES6(node.name)) {
        node.type = "Identifier";
      } else {
        return t.stringLiteral(node.name);
      }
    } else if (t.isJSXMemberExpression(node)) {
      return t.memberExpression(
        convertJSXIdentifier(node.object, node),
        convertJSXIdentifier(node.property, node),
      );
    }

    return node;
  }

  function convertAttributeValue(node) {
    if (t.isJSXExpressionContainer(node)) {
      return node.expression;
    } else {
      return node;
    }
  }

  function convertAttribute(node) {
    const value = convertAttributeValue(node.value || t.booleanLiteral(true));

    if (t.isStringLiteral(value) && !t.isJSXExpressionContainer(node.value)) {
      value.value = value.value.replace(/\n\s+/g, " ");

      // "raw" JSXText should not be used from a StringLiteral because it needs to be escaped.
      if (value.extra && value.extra.raw) {
        delete value.extra.raw;
      }
    }

    if (t.isValidIdentifier(node.name.name)) {
      node.name.type = "Identifier";
    } else {
      node.name = t.stringLiteral(node.name.name);
    }

    return t.inherits(t.objectProperty(node.name, value), node);
  }

  function buildElementCall(path, file) {
    path.parent.children = t.react.buildChildren(path.parent);

    const tagExpr = convertJSXIdentifier(path.node.name, path.node);
    const args = [];

    let tagName;
    if (t.isIdentifier(tagExpr)) {
      tagName = tagExpr.name;
    } else if (t.isLiteral(tagExpr)) {
      tagName = tagExpr.value;
    }

    const state: ElementState = {
      tagExpr: tagExpr,
      tagName: tagName,
      args: args,
    };

    if (opts.pre) {
      opts.pre(state, file);
    }

    let attribs = path.node.attributes;
    if (attribs.length) {
      attribs = buildOpeningElementAttributes(attribs, file);
    } else {
      attribs = t.nullLiteral();
    }

    args.push(attribs);

    if (opts.post) {
      opts.post(state, file);
    }

    return state.call || t.callExpression(state.callee, args);
  }

  function pushProps(_props, objs) {
    if (!_props.length) return _props;

    objs.push(t.objectExpression(_props));
    return [];
  }

  /**
   * The logic for this is quite terse. It's because we need to
   * support spread elements. We loop over all attributes,
   * breaking on spreads, we then push a new object containing
   * all prior attributes to an array for later processing.
   */

  function buildOpeningElementAttributes(attribs, file) {
    let _props = [];
    const objs = [];

    const useBuiltIns = file.opts.useBuiltIns || false;
    if (typeof useBuiltIns !== "boolean") {
      throw new Error(
        "transform-react-jsx currently only accepts a boolean option for " +
          "useBuiltIns (defaults to false)",
      );
    }

    while (attribs.length) {
      const prop = attribs.shift();
      if (t.isJSXSpreadAttribute(prop)) {
        _props = pushProps(_props, objs);
        objs.push(prop.argument);
      } else {
        _props.push(convertAttribute(prop));
      }
    }

    pushProps(_props, objs);

    if (objs.length === 1) {
      // only one object
      attribs = objs[0];
    } else {
      // looks like we have multiple objects
      if (!t.isObjectExpression(objs[0])) {
        objs.unshift(t.objectExpression([]));
      }

      const helper = useBuiltIns
        ? t.memberExpression(t.identifier("Object"), t.identifier("assign"))
        : file.addHelper("extends");

      // spread it
      attribs = t.callExpression(helper, objs);
    }

    return attribs;
  }
}
