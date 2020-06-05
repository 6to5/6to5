// @flow
import defineType, {
  assertOptionalChainStart,
  assertEach,
  assertNodeType,
  assertNodeOrValueType,
  assertValueType,
  chain,
} from "./utils";
import {
  classMethodOrPropertyCommon,
  classMethodOrDeclareMethodCommon,
} from "./es2015";

defineType("ArgumentPlaceholder", {});

defineType("AwaitExpression", {
  builder: ["argument"],
  visitor: ["argument"],
  aliases: ["Expression", "Terminatorless"],
  fields: {
    argument: {
      validate: assertNodeType("Expression"),
    },
  },
});

defineType("BindExpression", {
  visitor: ["object", "callee"],
  aliases: ["Expression"],
  fields: !process.env.BABEL_TYPES_8_BREAKING
    ? {}
    : {
        object: {
          validate: assertNodeType("Expression"),
        },
        callee: {
          validate: assertNodeType("Expression"),
        },
      },
});

defineType("ClassProperty", {
  visitor: ["key", "value", "typeAnnotation", "decorators"],
  builder: [
    "key",
    "value",
    "typeAnnotation",
    "decorators",
    "computed",
    "static",
  ],
  aliases: ["Property"],
  fields: {
    ...classMethodOrPropertyCommon,
    value: {
      validate: assertNodeType("Expression"),
      optional: true,
    },
    definite: {
      validate: assertValueType("boolean"),
      optional: true,
    },
    typeAnnotation: {
      validate: assertNodeType("TypeAnnotation", "TSTypeAnnotation", "Noop"),
      optional: true,
    },
    decorators: {
      validate: chain(
        assertValueType("array"),
        assertEach(assertNodeType("Decorator")),
      ),
      optional: true,
    },
    readonly: {
      validate: assertValueType("boolean"),
      optional: true,
    },
    declare: {
      validate: assertValueType("boolean"),
      optional: true,
    },
  },
});

defineType("EventualMemberExpression", {
  builder: ["object", "property", "computed"],
  visitor: ["object", "property"],
  aliases: ["Expression"],
  fields: {
    object: {
      validate: assertNodeType("Expression"),
    },
    property: {
      validate: (function() {
        const normal = assertNodeType("Identifier");
        const computed = assertNodeType("Expression");

        return function(node, key, val) {
          const validator = node.computed ? computed : normal;
          validator(node, key, val);
        };
      })(),
    },
    computed: {
      default: false,
    },
  },
});

defineType("EventualMemberCallExpression", {
  visitor: [
    "callee",
    "property",
    "arguments",
    "computed",
    "typeParameters",
    "typeArguments",
  ],
  builder: ["callee", "property", "arguments"],
  aliases: ["Expression"],
  fields: {
    callee: {
      validate: assertNodeType("Expression"),
    },
    property: {
      validate: (function() {
        const normal = assertNodeType("Identifier");
        const computed = assertNodeType("Expression");

        return function(node, key, val) {
          const validator = node.computed ? computed : normal;
          validator(node, key, val);
        };
      })(),
    },
    arguments: {
      validate: chain(
        assertValueType("array"),
        assertEach(
          assertNodeType("Expression", "SpreadElement", "JSXNamespacedName"),
        ),
      ),
    },
    computed: {
      default: false,
    },
  },
});

defineType("OptionalMemberExpression", {
  builder: ["object", "property", "computed", "optional"],
  visitor: ["object", "property"],
  aliases: ["Expression"],
  fields: {
    object: {
      validate: assertNodeType("Expression"),
    },
    property: {
      validate: (function() {
        const normal = assertNodeType("Identifier");
        const computed = assertNodeType("Expression");

        return function(node, key, val) {
          const validator = node.computed ? computed : normal;
          validator(node, key, val);
        };
      })(),
    },
    computed: {
      default: false,
    },
    optional: {
      validate: !process.env.BABEL_TYPES_8_BREAKING
        ? assertValueType("boolean")
        : chain(assertValueType("boolean"), assertOptionalChainStart()),
    },
  },
});

defineType("PipelineTopicExpression", {
  builder: ["expression"],
  visitor: ["expression"],
  fields: {
    expression: {
      validate: assertNodeType("Expression"),
    },
  },
});

defineType("PipelineBareFunction", {
  builder: ["callee"],
  visitor: ["callee"],
  fields: {
    callee: {
      validate: assertNodeType("Expression"),
    },
  },
});

defineType("PipelinePrimaryTopicReference", {
  aliases: ["Expression"],
});

defineType("EventualCallExpression", {
  visitor: ["callee", "arguments", "typeParameters", "typeArguments"],
  builder: ["callee", "arguments"],
  aliases: ["Expression"],
  fields: {
    callee: {
      validate: assertNodeType("Expression"),
    },
    arguments: {
      validate: chain(
        assertValueType("array"),
        assertEach(
          assertNodeType("Expression", "SpreadElement", "JSXNamespacedName"),
        ),
      ),
    },
    typeArguments: {
      validate: assertNodeType("TypeParameterInstantiation"),
      optional: true,
    },
    typeParameters: {
      validate: assertNodeType("TSTypeParameterInstantiation"),
      optional: true,
    },
  },
});

defineType("OptionalCallExpression", {
  visitor: ["callee", "arguments", "typeParameters", "typeArguments"],
  builder: ["callee", "arguments", "optional"],
  aliases: ["Expression"],
  fields: {
    callee: {
      validate: assertNodeType("Expression"),
    },
    arguments: {
      validate: chain(
        assertValueType("array"),
        assertEach(
          assertNodeType("Expression", "SpreadElement", "JSXNamespacedName"),
        ),
      ),
    },
    optional: {
      validate: !process.env.BABEL_TYPES_8_BREAKING
        ? assertValueType("boolean")
        : chain(assertValueType("boolean"), assertOptionalChainStart()),
    },
    typeArguments: {
      validate: assertNodeType("TypeParameterInstantiation"),
      optional: true,
    },
    typeParameters: {
      validate: assertNodeType("TSTypeParameterInstantiation"),
      optional: true,
    },
  },
});

defineType("ClassPrivateProperty", {
  visitor: ["key", "value", "decorators"],
  builder: ["key", "value", "decorators"],
  aliases: ["Property", "Private"],
  fields: {
    key: {
      validate: assertNodeType("PrivateName"),
    },
    value: {
      validate: assertNodeType("Expression"),
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

defineType("ClassPrivateMethod", {
  builder: ["kind", "key", "params", "body", "static"],
  visitor: [
    "key",
    "params",
    "body",
    "decorators",
    "returnType",
    "typeParameters",
  ],
  aliases: [
    "Function",
    "Scopable",
    "BlockParent",
    "FunctionParent",
    "Method",
    "Private",
  ],
  fields: {
    ...classMethodOrDeclareMethodCommon,
    key: {
      validate: assertNodeType("PrivateName"),
    },
    body: {
      validate: assertNodeType("BlockStatement"),
    },
  },
});

defineType("Import", {
  aliases: ["Expression"],
});

defineType("ImportAttribute", {
  visitor: ["key", "value"],
});

defineType("Decorator", {
  visitor: ["expression"],
  fields: {
    expression: {
      validate: assertNodeType("Expression"),
    },
  },
});

defineType("DoExpression", {
  visitor: ["body"],
  aliases: ["Expression"],
  fields: {
    body: {
      validate: assertNodeType("BlockStatement"),
    },
  },
});

defineType("ExportDefaultSpecifier", {
  visitor: ["exported"],
  aliases: ["ModuleSpecifier"],
  fields: {
    exported: {
      validate: assertNodeType("Identifier"),
    },
  },
});

defineType("ExportNamespaceSpecifier", {
  visitor: ["exported"],
  aliases: ["ModuleSpecifier"],
  fields: {
    exported: {
      validate: assertNodeType("Identifier"),
    },
  },
});

defineType("PrivateName", {
  visitor: ["id"],
  aliases: ["Private"],
  fields: {
    id: {
      validate: assertNodeType("Identifier"),
    },
  },
});

defineType("BigIntLiteral", {
  builder: ["value"],
  fields: {
    value: {
      validate: assertValueType("string"),
    },
  },
  aliases: ["Expression", "Pureish", "Literal", "Immutable"],
});

defineType("RecordExpression", {
  visitor: ["properties"],
  aliases: ["Expression"],
  fields: {
    properties: {
      validate: chain(
        assertValueType("array"),
        assertEach(
          assertNodeType("ObjectProperty", "ObjectMethod", "SpreadElement"),
        ),
      ),
    },
  },
});

defineType("TupleExpression", {
  fields: {
    elements: {
      validate: chain(
        assertValueType("array"),
        assertEach(
          assertNodeOrValueType("null", "Expression", "SpreadElement"),
        ),
      ),
      default: [],
    },
  },
  visitor: ["elements"],
  aliases: ["Expression"],
});
