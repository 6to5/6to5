import * as t from "babel-types";

export function AnyTypeAnnotation() {
  this.word("any");
}

export function ArrayTypeAnnotation(node: Object) {
  this.print(node.elementType, node);
  this.token("[");
  this.token("]");
}

export function BooleanTypeAnnotation() {
  this.word("boolean");
}

export function BooleanLiteralTypeAnnotation(node: Object) {
  this.word(node.value ? "true" : "false");
}

export function NullLiteralTypeAnnotation() {
  this.word("null");
}

export function DeclareClass(node: Object, parent: Object) {
  if (!t.isDeclareExportDeclaration(parent)) {
    this.word("declare");
    this.space();
  }
  this.word("class");
  this.space();
  this._interfaceish(node);
}

export function DeclareFunction(node: Object, parent: Object) {
  if (!t.isDeclareExportDeclaration(parent)) {
    this.word("declare");
    this.space();
  }
  this.word("function");
  this.space();
  this.print(node.id, node);
  this.print(node.id.typeAnnotation.typeAnnotation, node);
  this.semicolon();
}

export function DeclareInterface(node: Object) {
  this.word("declare");
  this.space();
  this.InterfaceDeclaration(node);
}

export function DeclareModule(node: Object) {
  this.word("declare");
  this.space();
  this.word("module");
  this.space();
  this.print(node.id, node);
  this.space();
  this.print(node.body, node);
}

export function DeclareModuleExports(node: Object) {
  this.word("declare");
  this.space();
  this.word("module");
  this.token(".");
  this.word("exports");
  this.print(node.typeAnnotation, node);
}

export function DeclareTypeAlias(node: Object) {
  this.word("declare");
  this.space();
  this.TypeAlias(node);
}

export function DeclareVariable(node: Object, parent: Object) {
  if (!t.isDeclareExportDeclaration(parent)) {
    this.word("declare");
    this.space();
  }
  this.word("var");
  this.space();
  this.print(node.id, node);
  this.print(node.id.typeAnnotation, node);
  this.semicolon();
}

export function DeclareExportDeclaration(node: Object) {
  this.word("declare");
  this.space();
  this.word("export");
  this.space();
  if (node.default) {
    this.word("default");
    this.space();
  }

  FlowExportDeclaration.apply(this, arguments);
}

export function DeclareExportAllDeclaration(node: Object) {
  this.word("declare");
  this.space();
  this.word("export");
  this.space();
  this.token("*");
  this.space();
  this.word("from");
  this.space();
  this.print(node.source, node);
  this.semicolon();
}

function FlowExportDeclaration(node: Object) {
  if (node.declaration) {
    const declar = node.declaration;
    this.print(declar, node);
    if (!t.isStatement(declar)) this.semicolon();
  } else {
    this.token("{");
    if (node.specifiers.length) {
      this.space();
      this.printList(node.specifiers, node);
      this.space();
    }
    this.token("}");

    if (node.source) {
      this.space();
      this.word("from");
      this.space();
      this.print(node.source, node);
    }

    this.semicolon();
  }
}

export function ExistsTypeAnnotation() {
  this.token("*");
}

export function FunctionTypeAnnotation(node: Object, parent: Object) {
  this.print(node.typeParameters, node);
  this.token("(");
  this.printList(node.params, node);

  if (node.rest) {
    if (node.params.length) {
      this.token(",");
      this.space();
    }
    this.token("...");
    this.print(node.rest, node);
  }

  this.token(")");

  // this node type is overloaded, not sure why but it makes it EXTREMELY annoying
  if (
    parent.type === "ObjectTypeCallProperty" ||
    parent.type === "DeclareFunction"
  ) {
    this.token(":");
  } else {
    this.space();
    this.token("=>");
  }

  this.space();
  this.print(node.returnType, node);
}

export function FunctionTypeParam(node: Object) {
  this.print(node.name, node);
  if (node.optional) this.token("?");
  this.token(":");
  this.space();
  this.print(node.typeAnnotation, node);
}

export function InterfaceExtends(node: Object) {
  this.print(node.id, node);
  this.print(node.typeParameters, node);
}

export {
  InterfaceExtends as ClassImplements,
  InterfaceExtends as GenericTypeAnnotation,
};

export function _interfaceish(node: Object) {
  this.print(node.id, node);
  this.print(node.typeParameters, node);
  if (node.extends.length) {
    this.space();
    this.word("extends");
    this.space();
    this.printList(node.extends, node);
  }
  if (node.mixins && node.mixins.length) {
    this.space();
    this.word("mixins");
    this.space();
    this.printList(node.mixins, node);
  }
  this.space();
  this.print(node.body, node);
}

export function _variance(node) {
  if (node.variance) {
    if (node.variance.kind === "plus") {
      this.token("+");
    } else if (node.variance.kind === "minus") {
      this.token("-");
    }
  }
}

export function InterfaceDeclaration(node: Object) {
  this.word("interface");
  this.space();
  this._interfaceish(node);
}

function andSeparator() {
  this.space();
  this.token("&");
  this.space();
}

export function IntersectionTypeAnnotation(node: Object) {
  this.printJoin(node.types, node, { separator: andSeparator });
}

export function MixedTypeAnnotation() {
  this.word("mixed");
}

export function EmptyTypeAnnotation() {
  this.word("empty");
}

export function NullableTypeAnnotation(node: Object) {
  this.token("?");
  this.print(node.typeAnnotation, node);
}

export {
  NumericLiteral as NumberLiteralTypeAnnotation,
  StringLiteral as StringLiteralTypeAnnotation,
} from "./types";

export function NumberTypeAnnotation() {
  this.word("number");
}

export function StringTypeAnnotation() {
  this.word("string");
}

export function ThisTypeAnnotation() {
  this.word("this");
}

export function TupleTypeAnnotation(node: Object) {
  this.token("[");
  this.printList(node.types, node);
  this.token("]");
}

export function TypeofTypeAnnotation(node: Object) {
  this.word("typeof");
  this.space();
  this.print(node.argument, node);
}

export function TypeAlias(node: Object) {
  this.word("type");
  this.space();
  this.print(node.id, node);
  this.print(node.typeParameters, node);
  this.space();
  this.token("=");
  this.space();
  this.print(node.right, node);
  this.semicolon();
}

export function TypeAnnotation(node: Object) {
  this.token(":");
  this.space();
  if (node.optional) this.token("?");
  this.print(node.typeAnnotation, node);
}

export function TypeParameter(node: Object) {
  this._variance(node);

  this.word(node.name);

  if (node.bound) {
    this.print(node.bound, node);
  }

  if (node.default) {
    this.space();
    this.token("=");
    this.space();
    this.print(node.default, node);
  }
}

export function TypeParameterInstantiation(node: Object) {
  this.token("<");
  this.printList(node.params, node, {});
  this.token(">");
}

export { TypeParameterInstantiation as TypeParameterDeclaration };

export function ObjectTypeAnnotation(node: Object) {
  if (node.exact) {
    this.token("{|");
  } else {
    this.token("{");
  }

  // TODO: remove the array fallbacks and instead enforce the types to require an array
  const props = node.properties.concat(
    node.callProperties || [],
    node.indexers || [],
  );

  if (props.length) {
    this.space();

    this.printJoin(props, node, {
      addNewlines(leading) {
        if (leading && !props[0]) return 1;
      },
      indent: true,
      statement: true,
      iterator: () => {
        if (props.length !== 1) {
          this.token(",");
          this.space();
        }
      },
    });

    this.space();
  }

  if (node.exact) {
    this.token("|}");
  } else {
    this.token("}");
  }
}

export function ObjectTypeCallProperty(node: Object) {
  if (node.static) {
    this.word("static");
    this.space();
  }
  this.print(node.value, node);
}

export function ObjectTypeIndexer(node: Object) {
  if (node.static) {
    this.word("static");
    this.space();
  }
  this._variance(node);
  this.token("[");
  this.print(node.id, node);
  this.token(":");
  this.space();
  this.print(node.key, node);
  this.token("]");
  this.token(":");
  this.space();
  this.print(node.value, node);
}

export function ObjectTypeProperty(node: Object) {
  if (node.static) {
    this.word("static");
    this.space();
  }
  this._variance(node);
  this.print(node.key, node);
  if (node.optional) this.token("?");
  this.token(":");
  this.space();
  this.print(node.value, node);
}

export function ObjectTypeSpreadProperty(node: Object) {
  this.token("...");
  this.print(node.argument, node);
}

export function QualifiedTypeIdentifier(node: Object) {
  this.print(node.qualification, node);
  this.token(".");
  this.print(node.id, node);
}

function orSeparator() {
  this.space();
  this.token("|");
  this.space();
}

export function UnionTypeAnnotation(node: Object) {
  this.printJoin(node.types, node, { separator: orSeparator });
}

export function TypeCastExpression(node: Object) {
  this.token("(");
  this.print(node.expression, node);
  this.print(node.typeAnnotation, node);
  this.token(")");
}

export function VoidTypeAnnotation() {
  this.word("void");
}
