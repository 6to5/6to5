import * as t from "babel-types";
import jsesc from "jsesc";

export function Identifier(node: Object) {
  this.word(node.name);
}

export function RestElement(node: Object) {
  this.token("...");
  this.print(node.argument, node);
}

export { RestElement as SpreadElement };

export function ObjectExpression(node: Object) {
  const props = node.properties;

  this.token("{");
  this.printInnerComments(node);

  if (props.length) {
    this.space();
    this.printList(props, node, { indent: true, statement: true });
    this.space();
  }

  this.token("}");
}

export { ObjectExpression as ObjectPattern };

export function ObjectMethod(node: Object) {
  this.printJoin(node.decorators, node);
  this._method(node);
}

export function ObjectProperty(node: Object) {
  this.printJoin(node.decorators, node);

  if (node.computed) {
    this.token("[");
    this.print(node.key, node);
    this.token("]");
  } else {
    // print `({ foo: foo = 5 } = {})` as `({ foo = 5 } = {});`
    if (
      t.isAssignmentPattern(node.value) &&
      t.isIdentifier(node.key) &&
      node.key.name === node.value.left.name
    ) {
      this.print(node.value, node);
      return;
    }

    this.print(node.key, node);

    // shorthand!
    if (
      node.shorthand &&
      (t.isIdentifier(node.key) &&
        t.isIdentifier(node.value) &&
        node.key.name === node.value.name)
    ) {
      return;
    }
  }

  this.token(":");
  this.space();
  this.print(node.value, node);
}

export function ArrayExpression(node: Object) {
  const elems = node.elements;
  const len = elems.length;

  this.token("[");
  this.printInnerComments(node);

  for (let i = 0; i < elems.length; i++) {
    const elem = elems[i];
    if (elem) {
      if (i > 0) this.space();
      this.print(elem, node);
      if (i < len - 1) this.token(",");
    } else {
      // If the array expression ends with a hole, that hole
      // will be ignored by the interpreter, but if it ends with
      // two (or more) holes, we need to write out two (or more)
      // commas so that the resulting code is interpreted with
      // both (all) of the holes.
      this.token(",");
    }
  }

  this.token("]");
}

export { ArrayExpression as ArrayPattern };

export function RegExpLiteral(node: Object) {
  this.word(`/${node.pattern}/${node.flags}`);
}

export function BooleanLiteral(node: Object) {
  this.word(node.value ? "true" : "false");
}

export function NullLiteral() {
  this.word("null");
}

export function NumericLiteral(node: Object) {
  const raw = this.getPossibleRaw(node);
  const value = node.value + "";
  if (raw == null) {
    this.number(value); // normalize
  } else if (this.format.minified) {
    this.number(raw.length < value.length ? raw : value);
  } else {
    this.number(raw);
  }
}

export function StringLiteral(node: Object, parent: Object) {
  const raw = this.getPossibleRaw(node);
  if (!this.format.minified && raw != null) {
    this.token(raw);
    return;
  }

  // ensure the output is ASCII-safe
  const opts = {
    quotes: t.isJSX(parent) ? "double" : this.format.quotes,
    wrap: true,
  };
  if (this.format.jsonCompatibleStrings) {
    opts.json = true;
  }
  const val = jsesc(node.value, opts);

  return this.token(val);
}
