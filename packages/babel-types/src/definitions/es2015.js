// @flow
import defineType, {
  assertShape,
  assertNodeType,
  assertValueType,
  assertNodeOrValueType,
  chain,
  assertEach,
  assertOneOf,
  validateOptional,
} from "./utils";
import {
  functionCommon,
  functionTypeAnnotationCommon,
  patternLikeCommon,
} from "./core";
import is from "../validators/is";

defineType("AssignmentPattern", {
  visitor: ["left", "right", "decorators" /* for legacy param decorators */],
  builder: ["left", "right"],
  aliases: ["Pattern", "PatternLike", "LVal"],
  fields: {
    ...patternLikeCommon,
    left: {
      validate: assertNodeType(
        "Identifier",
        "ObjectPattern",
        "ArrayPattern",
        "MemberExpression",
      ),
    },
    right: {
      validate: assertNodeType("Expression"),
    },
    // For TypeScript
    decorators: {
      validate: chain(
        assertValueType("array"),
        assertEach(assertNodeType("Decorator")),
      ),
      optional: true,
    },
  },
});

defineType("ArrayPattern", {
  visitor: ["elements", "typeAnnotation"],
  builder: ["elements"],
  aliases: ["Pattern", "PatternLike", "LVal"],
  fields: {
    ...patternLikeCommon,
    elements: {
      validate: chain(
        assertValueType("array"),
        assertEach(assertNodeOrValueType("null", "PatternLike")),
      ),
    },
    // For TypeScript
    decorators: {
      validate: chain(
        assertValueType("array"),
        assertEach(assertNodeType("Decorator")),
      ),
      optional: true,
    },
  },
});

defineType("ArrowFunctionExpression", {
  builder: ["params", "body", "async"],
  visitor: ["params", "body", "returnType", "typeParameters"],
  aliases: [
    "Scopable",
    "Function",
    "BlockParent",
    "FunctionParent",
    "Expression",
    "Pureish",
  ],
  fields: {
    ...functionCommon,
    ...functionTypeAnnotationCommon,
    expression: {
      // https://github.com/babel/babylon/issues/505
      validate: assertValueType("boolean"),
    },
    body: {
      validate: assertNodeType("BlockStatement", "Expression"),
    },
  },
});

defineType("ClassBody", {
  visitor: ["body"],
  fields: {
    body: {
      validate: chain(
        assertValueType("array"),
        assertEach(
          assertNodeType(
            "ClassMethod",
            "ClassPrivateMethod",
            "ClassProperty",
            "ClassPrivateProperty",
            "TSDeclareMethod",
            "TSIndexSignature",
          ),
        ),
      ),
    },
  },
});

defineType("ClassExpression", {
  builder: ["id", "superClass", "body", "decorators"],
  visitor: [
    "id",
    "body",
    "superClass",
    "mixins",
    "typeParameters",
    "superTypeParameters",
    "implements",
    "decorators",
  ],
  aliases: ["Scopable", "Class", "Expression", "Pureish"],
  fields: {
    id: {
      validate: assertNodeType("Identifier"),
      // In declarations, this is missing if this is the
      // child of an ExportDefaultDeclaration.
      optional: true,
    },
    typeParameters: {
      validate: assertNodeType(
        "TypeParameterDeclaration",
        "TSTypeParameterDeclaration",
        "Noop",
      ),
      optional: true,
    },
    body: {
      validate: assertNodeType("ClassBody"),
    },
    superClass: {
      optional: true,
      validate: assertNodeType("Expression"),
    },
    superTypeParameters: {
      validate: assertNodeType(
        "TypeParameterInstantiation",
        "TSTypeParameterInstantiation",
      ),
      optional: true,
    },
    implements: {
      validate: chain(
        assertValueType("array"),
        assertEach(
          assertNodeType("TSExpressionWithTypeArguments", "ClassImplements"),
        ),
      ),
      optional: true,
    },
    decorators: {
      validate: chain(
        assertValueType("array"),
        assertEach(assertNodeType("Decorator")),
      ),
      optional: true,
    },
  },
});

defineType("ClassDeclaration", {
  inherits: "ClassExpression",
  aliases: ["Scopable", "Class", "Statement", "Declaration", "Pureish"],
  fields: {
    declare: {
      validate: assertValueType("boolean"),
      optional: true,
    },
    abstract: {
      validate: assertValueType("boolean"),
      optional: true,
    },
  },
  validate: (function() {
    const identifier = assertNodeType("Identifier");

    return function(parent, key, node) {
      if (!process.env.BABEL_TYPES_8_BREAKING) return;

      if (!is("ExportDefaultDeclaration", parent)) {
        identifier(node, "id", node.id);
      }
    };
  })(),
});

defineType("ExportAllDeclaration", {
  visitor: ["source"],
  aliases: [
    "Statement",
    "Declaration",
    "ModuleDeclaration",
    "ExportDeclaration",
  ],
  fields: {
    source: {
      validate: assertNodeType("StringLiteral"),
    },
  },
});

defineType("ExportDefaultDeclaration", {
  visitor: ["declaration"],
  aliases: [
    "Statement",
    "Declaration",
    "ModuleDeclaration",
    "ExportDeclaration",
  ],
  fields: {
    declaration: {
      validate: assertNodeType(
        "FunctionDeclaration",
        "TSDeclareFunction",
        "ClassDeclaration",
        "Expression",
      ),
    },
  },
});

defineType("ExportNamedDeclaration", {
  visitor: ["declaration", "specifiers", "source"],
  aliases: [
    "Statement",
    "Declaration",
    "ModuleDeclaration",
    "ExportDeclaration",
  ],
  fields: {
    declaration: {
      optional: true,
      validate: chain(
        assertNodeType("Declaration"),
        function(node, key, val) {
          if (!process.env.BABEL_TYPES_8_BREAKING) return;

          // This validator isn't put at the top level because we can run it
          // even if this node doesn't have a parent.

          if (val && node.specifiers.length) {
            throw new TypeError(
              "Only declaration or specifiers is allowed on ExportNamedDeclaration",
            );
          }
        },
        function(node, key, val) {
          if (!process.env.BABEL_TYPES_8_BREAKING) return;

          // This validator isn't put at the top level because we can run it
          // even if this node doesn't have a parent.

          if (val && node.source) {
            throw new TypeError("Cannot export a declaration from a source");
          }
        },
      ),
    },
    specifiers: {
      default: [],
      validate: chain(
        assertValueType("array"),
        assertEach(
          (function() {
            const sourced = assertNodeType(
              "ExportSpecifier",
              "ExportDefaultSpecifier",
              "ExportNamespaceSpecifier",
            );
            const sourceless = assertNodeType("ExportSpecifier");

            if (!process.env.BABEL_TYPES_8_BREAKING) return sourced;

            return function(node, key, val) {
              const validator = node.source ? sourced : sourceless;
              validator(node, key, val);
            };
          })(),
        ),
      ),
    },
    source: {
      validate: assertNodeType("StringLiteral"),
      optional: true,
    },
    exportKind: validateOptional(assertOneOf("type", "value")),
  },
});

defineType("ExportSpecifier", {
  visitor: ["local", "exported"],
  aliases: ["ModuleSpecifier"],
  fields: {
    local: {
      validate: assertNodeType("Identifier"),
    },
    exported: {
      validate: assertNodeType("Identifier"),
    },
  },
});

defineType("ForOfStatement", {
  visitor: ["left", "right", "body"],
  builder: ["left", "right", "body", "await"],
  aliases: [
    "Scopable",
    "Statement",
    "For",
    "BlockParent",
    "Loop",
    "ForXStatement",
  ],
  fields: {
    left: {
      validate: (function() {
        if (!process.env.BABEL_TYPES_8_BREAKING) {
          return assertNodeType("VariableDeclaration", "LVal");
        }

        const declaration = assertNodeType("VariableDeclaration");
        const lval = assertNodeType(
          "Identifier",
          "MemberExpression",
          "ArrayPattern",
          "ObjectPattern",
        );

        return function(node, key, val) {
          if (is("VariableDeclaration", val)) {
            declaration(node, key, val);
          } else {
            lval(node, key, val);
          }
        };
      })(),
    },
    right: {
      validate: assertNodeType("Expression"),
    },
    body: {
      validate: assertNodeType("Statement"),
    },
    await: {
      default: false,
    },
  },
});

defineType("ImportDeclaration", {
  visitor: ["specifiers", "source"],
  aliases: ["Statement", "Declaration", "ModuleDeclaration"],
  fields: {
    specifiers: {
      validate: chain(
        assertValueType("array"),
        assertEach(
          assertNodeType(
            "ImportSpecifier",
            "ImportDefaultSpecifier",
            "ImportNamespaceSpecifier",
          ),
        ),
      ),
    },
    source: {
      validate: assertNodeType("StringLiteral"),
    },
    importKind: {
      // Handle TypeScript/Flowtype's extension "import type foo from"
      // TypeScript doesn't support typeof
      validate: assertOneOf("type", "typeof", "value"),
      optional: true,
    },
  },
});

defineType("ImportDefaultSpecifier", {
  visitor: ["local"],
  aliases: ["ModuleSpecifier"],
  fields: {
    local: {
      validate: assertNodeType("Identifier"),
    },
  },
});

defineType("ImportNamespaceSpecifier", {
  visitor: ["local"],
  aliases: ["ModuleSpecifier"],
  fields: {
    local: {
      validate: assertNodeType("Identifier"),
    },
  },
});

defineType("ImportSpecifier", {
  visitor: ["local", "imported"],
  aliases: ["ModuleSpecifier"],
  fields: {
    local: {
      validate: assertNodeType("Identifier"),
    },
    imported: {
      validate: assertNodeType("Identifier"),
    },
    importKind: {
      // Handle Flowtype's extension "import {typeof foo} from"
      validate: assertOneOf("type", "typeof"),
      optional: true,
    },
  },
});

defineType("MetaProperty", {
  visitor: ["meta", "property"],
  aliases: ["Expression"],
  fields: {
    meta: {
      validate: chain(assertNodeType("Identifier"), function(node, key, val) {
        if (!process.env.BABEL_TYPES_8_BREAKING) return;

        let property;
        switch (val.name) {
          case "function":
            property = "sent";
            break;
          case "new":
            property = "target";
            break;
          case "import":
            property = "meta";
            break;
        }
        if (!is("Identifier", node.property, { name: property })) {
          throw new TypeError("Unrecognised MetaProperty");
        }
      }),
    },
    property: {
      validate: assertNodeType("Identifier"),
    },
  },
});

export const classMethodOrPropertyCommon = {
  abstract: {
    validate: assertValueType("boolean"),
    optional: true,
  },
  accessibility: {
    validate: assertOneOf("public", "private", "protected"),
    optional: true,
  },
  static: {
    default: false,
  },
  computed: {
    default: false,
  },
  optional: {
    validate: assertValueType("boolean"),
    optional: true,
  },
  key: {
    validate: chain(
      (function() {
        const normal = assertNodeType(
          "Identifier",
          "StringLiteral",
          "NumericLiteral",
        );
        const computed = assertNodeType("Expression");

        return function(node: Object, key: string, val: any) {
          const validator = node.computed ? computed : normal;
          validator(node, key, val);
        };
      })(),
      assertNodeType(
        "Identifier",
        "StringLiteral",
        "NumericLiteral",
        "Expression",
      ),
    ),
  },
};

export const classMethodOrDeclareMethodCommon = {
  ...functionCommon,
  ...classMethodOrPropertyCommon,
  kind: {
    validate: assertOneOf("get", "set", "method", "constructor"),
    default: "method",
  },
  access: {
    validate: chain(
      assertValueType("string"),
      assertOneOf("public", "private", "protected"),
    ),
    optional: true,
  },
  decorators: {
    validate: chain(
      assertValueType("array"),
      assertEach(assertNodeType("Decorator")),
    ),
    optional: true,
  },
};

defineType("ClassMethod", {
  aliases: ["Function", "Scopable", "BlockParent", "FunctionParent", "Method"],
  builder: [
    "kind",
    "key",
    "params",
    "body",
    "computed",
    "static",
    "generator",
    "async",
  ],
  visitor: [
    "key",
    "params",
    "body",
    "decorators",
    "returnType",
    "typeParameters",
  ],
  fields: {
    ...classMethodOrDeclareMethodCommon,
    ...functionTypeAnnotationCommon,
    body: {
      validate: assertNodeType("BlockStatement"),
    },
  },
});

defineType("ObjectPattern", {
  visitor: [
    "properties",
    "typeAnnotation",
    "decorators" /* for legacy param decorators */,
  ],
  builder: ["properties"],
  aliases: ["Pattern", "PatternLike", "LVal"],
  fields: {
    ...patternLikeCommon,
    properties: {
      validate: chain(
        assertValueType("array"),
        assertEach(assertNodeType("RestElement", "ObjectProperty")),
      ),
    },
  },
});

defineType("SpreadElement", {
  visitor: ["argument"],
  aliases: ["UnaryLike"],
  deprecatedAlias: "SpreadProperty",
  fields: {
    argument: {
      validate: assertNodeType("Expression"),
    },
  },
});

defineType("Super", {
  aliases: ["Expression"],
});

defineType("TaggedTemplateExpression", {
  visitor: ["tag", "quasi"],
  aliases: ["Expression"],
  fields: {
    tag: {
      validate: assertNodeType("Expression"),
    },
    quasi: {
      validate: assertNodeType("TemplateLiteral"),
    },
    typeParameters: {
      validate: assertNodeType(
        "TypeParameterInstantiation",
        "TSTypeParameterInstantiation",
      ),
      optional: true,
    },
  },
});

defineType("TemplateElement", {
  builder: ["value", "tail"],
  fields: {
    value: {
      validate: assertShape({
        raw: {
          validate: assertValueType("string"),
        },
        cooked: {
          validate: assertValueType("string"),
          optional: true,
        },
      }),
    },
    tail: {
      default: false,
    },
  },
});

defineType("TemplateLiteral", {
  visitor: ["quasis", "expressions"],
  aliases: ["Expression", "Literal"],
  fields: {
    quasis: {
      validate: chain(
        assertValueType("array"),
        assertEach(assertNodeType("TemplateElement")),
      ),
    },
    expressions: {
      validate: chain(
        assertValueType("array"),
        assertEach(assertNodeType("Expression")),
        function(node, key, val) {
          if (node.quasis.length !== val.length + 1) {
            throw new TypeError(
              `Number of ${
                node.type
              } quasis should be exactly one more than the number of expressions.\nExpected ${val.length +
                1} quasis but got ${node.quasis.length}`,
            );
          }
        },
      ),
    },
  },
});

defineType("YieldExpression", {
  builder: ["argument", "delegate"],
  visitor: ["argument"],
  aliases: ["Expression", "Terminatorless"],
  fields: {
    delegate: {
      validate: chain(assertValueType("boolean"), function(node, key, val) {
        if (!process.env.BABEL_TYPES_8_BREAKING) return;

        if (val && !node.argument) {
          throw new TypeError(
            "Property delegate of YieldExpression cannot be true if there is no argument",
          );
        }
      }),
      default: false,
    },
    argument: {
      optional: true,
      validate: assertNodeType("Expression"),
    },
  },
});
