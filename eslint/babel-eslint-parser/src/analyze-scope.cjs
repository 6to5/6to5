const escope = require("eslint-scope");
const { Definition } = require("eslint-scope/lib/definition");
const OriginalPatternVisitor = require("eslint-scope/lib/pattern-visitor");
const OriginalReferencer = require("eslint-scope/lib/referencer");
const { getKeys: fallback } = require("eslint-visitor-keys");

let visitorKeysMap;
function getVisitorValues(nodeType, client) {
  if (visitorKeysMap) return visitorKeysMap[nodeType];

  const { FLOW_FLIPPED_ALIAS_KEYS, VISITOR_KEYS } = client.getTypesInfo();

  const flowFlippedAliasKeys = FLOW_FLIPPED_ALIAS_KEYS.concat([
    "ArrayPattern",
    "ClassDeclaration",
    "ClassExpression",
    "FunctionDeclaration",
    "FunctionExpression",
    "Identifier",
    "ObjectPattern",
    "RestElement",
  ]);

  visitorKeysMap = Object.entries(VISITOR_KEYS).reduce((acc, [key, value]) => {
    if (!flowFlippedAliasKeys.includes(value)) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return visitorKeysMap[nodeType];
}

const propertyTypes = {
  // loops
  callProperties: { type: "loop", values: ["value"] },
  indexers: { type: "loop", values: ["key", "value"] },
  properties: { type: "loop", values: ["argument", "value"] },
  types: { type: "loop" },
  params: { type: "loop" },
  // single property
  argument: { type: "single" },
  elementType: { type: "single" },
  qualification: { type: "single" },
  rest: { type: "single" },
  returnType: { type: "single" },
  // others
  typeAnnotation: { type: "typeAnnotation" },
  typeParameters: { type: "typeParameters" },
  id: { type: "id" },
};

class PatternVisitor extends OriginalPatternVisitor {
  ArrayPattern(node) {
    node.elements.forEach(this.visit, this);
  }

  ObjectPattern(node) {
    node.properties.forEach(this.visit, this);
  }
}

class Referencer extends OriginalReferencer {
  #client;

  constructor(options, scopeManager, client) {
    super(options, scopeManager);
    this.#client = client;
  }

  // inherits.
  visitPattern(node, options, callback) {
    if (!node) {
      return;
    }

    // Visit type annotations.
    this._checkIdentifierOrVisit(node.typeAnnotation);
    if (node.type === "AssignmentPattern") {
      this._checkIdentifierOrVisit(node.left.typeAnnotation);
    }

    // Overwrite `super.visitPattern(node, options, callback)` in order to not visit `ArrayPattern#typeAnnotation` and `ObjectPattern#typeAnnotation`.
    if (typeof options === "function") {
      callback = options;
      options = { processRightHandNodes: false };
    }

    const visitor = new PatternVisitor(this.options, node, callback);
    visitor.visit(node);

    // Process the right hand nodes recursively.
    if (options.processRightHandNodes) {
      visitor.rightHandNodes.forEach(this.visit, this);
    }
  }

  // inherits.
  visitClass(node) {
    // Decorators.
    this._visitArray(node.decorators);

    // Flow type parameters.
    const typeParamScope = this._nestTypeParamScope(node);

    // Flow super types.
    this._visitTypeAnnotation(node.implements);
    this._visitTypeAnnotation(
      node.superTypeParameters && node.superTypeParameters.params,
    );

    // Basic.
    super.visitClass(node);

    // Close the type parameter scope.
    if (typeParamScope) {
      this.close(node);
    }
  }

  // inherits.
  visitFunction(node) {
    const typeParamScope = this._nestTypeParamScope(node);

    // Flow return types.
    this._checkIdentifierOrVisit(node.returnType);

    // Basic.
    super.visitFunction(node);

    // Close the type parameter scope.
    if (typeParamScope) {
      this.close(node);
    }
  }

  // inherits.
  visitProperty(node) {
    if (node.value?.type === "TypeCastExpression") {
      this._visitTypeAnnotation(node.value);
    }
    this._visitArray(node.decorators);
    super.visitProperty(node);
  }

  InterfaceDeclaration(node) {
    this._createScopeVariable(node, node.id);

    const typeParamScope = this._nestTypeParamScope(node);

    // TODO: Handle mixins
    this._visitArray(node.extends);
    this.visit(node.body);

    if (typeParamScope) {
      this.close(node);
    }
  }

  TypeAlias(node) {
    this._createScopeVariable(node, node.id);

    const typeParamScope = this._nestTypeParamScope(node);

    this.visit(node.right);

    if (typeParamScope) {
      this.close(node);
    }
  }

  ClassProperty(node) {
    this._visitClassProperty(node);
  }

  ClassPrivateProperty(node) {
    this._visitClassProperty(node);
  }

  PropertyDefinition(node) {
    this._visitClassProperty(node);
  }

  // TODO: Update to visit type annotations when TypeScript/Flow support this syntax.
  ClassPrivateMethod(node) {
    super.MethodDefinition(node);
  }

  DeclareModule(node) {
    this._visitDeclareX(node);
  }

  DeclareFunction(node) {
    this._visitDeclareX(node);
  }

  DeclareVariable(node) {
    this._visitDeclareX(node);
  }

  DeclareClass(node) {
    this._visitDeclareX(node);
  }

  // visit OptionalMemberExpression as a MemberExpression.
  OptionalMemberExpression(node) {
    super.MemberExpression(node);
  }

  _visitClassProperty(node) {
    this._visitTypeAnnotation(node.typeAnnotation);
    this.visitProperty(node);
  }

  _visitDeclareX(node) {
    if (node.id) {
      this._createScopeVariable(node, node.id);
    }

    const typeParamScope = this._nestTypeParamScope(node);
    if (typeParamScope) {
      this.close(node);
    }
  }

  _createScopeVariable(node, name) {
    this.currentScope().variableScope.__define(
      name,
      new Definition("Variable", name, node, null, null, null),
    );
  }

  _nestTypeParamScope(node) {
    if (!node.typeParameters) {
      return null;
    }

    const parentScope = this.scopeManager.__currentScope;
    const scope = new escope.Scope(
      this.scopeManager,
      "type-parameters",
      parentScope,
      node,
      false,
    );

    this.scopeManager.__nestScope(scope);
    for (let j = 0; j < node.typeParameters.params.length; j++) {
      const name = node.typeParameters.params[j];
      scope.__define(name, new Definition("TypeParameter", name, name));
      if (name.typeAnnotation) {
        this._checkIdentifierOrVisit(name);
      }
    }
    scope.__define = function () {
      return parentScope.__define.apply(parentScope, arguments);
    };

    return scope;
  }

  _visitTypeAnnotation(node) {
    if (!node) {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(this._visitTypeAnnotation, this);
      return;
    }

    // get property to check (params, id, etc...)
    const visitorValues = getVisitorValues(node.type, this.#client);
    if (!visitorValues) {
      return;
    }

    // can have multiple properties
    for (let i = 0; i < visitorValues.length; i++) {
      const visitorValue = visitorValues[i];
      const propertyType = propertyTypes[visitorValue];
      const nodeProperty = node[visitorValue];
      // check if property or type is defined
      if (propertyType == null || nodeProperty == null) {
        continue;
      }
      if (propertyType.type === "loop") {
        for (let j = 0; j < nodeProperty.length; j++) {
          if (Array.isArray(propertyType.values)) {
            for (let k = 0; k < propertyType.values.length; k++) {
              const loopPropertyNode = nodeProperty[j][propertyType.values[k]];
              if (loopPropertyNode) {
                this._checkIdentifierOrVisit(loopPropertyNode);
              }
            }
          } else {
            this._checkIdentifierOrVisit(nodeProperty[j]);
          }
        }
      } else if (propertyType.type === "single") {
        this._checkIdentifierOrVisit(nodeProperty);
      } else if (propertyType.type === "typeAnnotation") {
        this._visitTypeAnnotation(node.typeAnnotation);
      } else if (propertyType.type === "typeParameters") {
        for (let l = 0; l < node.typeParameters.params.length; l++) {
          this._checkIdentifierOrVisit(node.typeParameters.params[l]);
        }
      } else if (propertyType.type === "id") {
        if (node.id.type === "Identifier") {
          this._checkIdentifierOrVisit(node.id);
        } else {
          this._visitTypeAnnotation(node.id);
        }
      }
    }
  }

  _checkIdentifierOrVisit(node) {
    if (node?.typeAnnotation) {
      this._visitTypeAnnotation(node.typeAnnotation);
    } else if (node?.type === "Identifier") {
      this.visit(node);
    } else {
      this._visitTypeAnnotation(node);
    }
  }

  _visitArray(nodeList) {
    if (nodeList) {
      for (const node of nodeList) {
        this.visit(node);
      }
    }
  }
}

module.exports = function analyzeScope(ast, parserOptions, client) {
  const options = {
    ignoreEval: true,
    optimistic: false,
    directive: false,
    nodejsScope:
      ast.sourceType === "script" &&
      (parserOptions.ecmaFeatures &&
        parserOptions.ecmaFeatures.globalReturn) === true,
    impliedStrict: false,
    sourceType: ast.sourceType,
    ecmaVersion: parserOptions.ecmaVersion,
    fallback,
  };

  options.childVisitorKeys = client.getVisitorKeys();

  const scopeManager = new escope.ScopeManager(options);
  const referencer = new Referencer(options, scopeManager, client);

  referencer.visit(ast);

  return scopeManager;
};
