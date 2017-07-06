import defineType, {
  assertNodeType,
  assertValueType,
  chain,
  assertEach,
} from "./index";

defineType("JSXAttribute", {
  visitor: ["name", "value"],
  aliases: ["JSX", "Immutable"],
  fields: {
    name: {
      validate: assertNodeType("JSXIdentifier", "JSXNamespacedName"),
    },
    value: {
      optional: true,
      validate: assertNodeType(
        "JSXElement",
        "StringLiteral",
        "JSXExpressionContainer",
      ),
    },
  },
});

defineType("JSXClosingElement", {
  visitor: ["name"],
  aliases: ["JSX", "Immutable"],
  fields: {
    name: {
      validate: assertNodeType("JSXIdentifier", "JSXMemberExpression"),
    },
  },
});

defineType("JSXElement", {
  builder: ["openingElement", "closingElement", "children", "selfClosing"],
  visitor: ["openingElement", "children", "closingElement"],
  aliases: ["JSX", "Immutable", "Expression"],
  fields: {
    openingElement: {
      validate: assertNodeType("JSXOpeningElement"),
    },
    closingElement: {
      optional: true,
      validate: assertNodeType("JSXClosingElement"),
    },
    children: {
      validate: chain(
        assertValueType("array"),
        assertEach(
          assertNodeType(
            "JSXText",
            "JSXExpressionContainer",
            "JSXSpreadChild",
            "JSXElement",
          ),
        ),
      ),
    },
  },
});

defineType("JSXEmptyExpression", {
  aliases: ["JSX", "Expression"],
});

defineType("JSXExpressionContainer", {
  visitor: ["expression"],
  aliases: ["JSX", "Immutable"],
  fields: {
    expression: {
      validate: assertNodeType("Expression"),
    },
  },
});

defineType("JSXSpreadChild", {
  visitor: ["expression"],
  aliases: ["JSX", "Immutable"],
  fields: {
    expression: {
      validate: assertNodeType("Expression"),
    },
  },
});

defineType("JSXIdentifier", {
  builder: ["name"],
  aliases: ["JSX", "Expression"],
  fields: {
    name: {
      validate: assertValueType("string"),
    },
  },
});

defineType("JSXMemberExpression", {
  visitor: ["object", "property"],
  aliases: ["JSX", "Expression"],
  fields: {
    object: {
      validate: assertNodeType("JSXMemberExpression", "JSXIdentifier"),
    },
    property: {
      validate: assertNodeType("JSXIdentifier"),
    },
  },
});

defineType("JSXNamespacedName", {
  visitor: ["namespace", "name"],
  aliases: ["JSX"],
  fields: {
    namespace: {
      validate: assertNodeType("JSXIdentifier"),
    },
    name: {
      validate: assertNodeType("JSXIdentifier"),
    },
  },
});

defineType("JSXOpeningElement", {
  builder: ["name", "attributes", "selfClosing"],
  visitor: ["name", "attributes"],
  aliases: ["JSX", "Immutable"],
  fields: {
    name: {
      validate: assertNodeType("JSXIdentifier", "JSXMemberExpression"),
    },
    selfClosing: {
      default: false,
      validate: assertValueType("boolean"),
    },
    attributes: {
      validate: chain(
        assertValueType("array"),
        assertEach(assertNodeType("JSXAttribute", "JSXSpreadAttribute")),
      ),
    },
  },
});

defineType("JSXSpreadAttribute", {
  visitor: ["argument"],
  aliases: ["JSX"],
  fields: {
    argument: {
      validate: assertNodeType("Expression"),
    },
  },
});

defineType("JSXText", {
  aliases: ["JSX", "Immutable"],
  builder: ["value"],
  fields: {
    value: {
      validate: assertValueType("string"),
    },
  },
});
