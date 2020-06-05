// @flow
/*
 * This file is auto-generated! Do not modify it directly.
 * To re-generate run 'make build'
 */
import is from "../../validators/is";

function assert(type: string, node: Object, opts?: Object): void {
  if (!is(type, node, opts)) {
    throw new Error(
      `Expected type "${type}" with option ${JSON.stringify((opts: any))}, ` +
        `but instead got "${node.type}".`,
    );
  }
}

export function assertArrayExpression(node: Object, opts?: Object = {}): void {
  assert("ArrayExpression", node, opts);
}
export function assertAssignmentExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("AssignmentExpression", node, opts);
}
export function assertBinaryExpression(node: Object, opts?: Object = {}): void {
  assert("BinaryExpression", node, opts);
}
export function assertInterpreterDirective(
  node: Object,
  opts?: Object = {},
): void {
  assert("InterpreterDirective", node, opts);
}
export function assertDirective(node: Object, opts?: Object = {}): void {
  assert("Directive", node, opts);
}
export function assertDirectiveLiteral(node: Object, opts?: Object = {}): void {
  assert("DirectiveLiteral", node, opts);
}
export function assertBlockStatement(node: Object, opts?: Object = {}): void {
  assert("BlockStatement", node, opts);
}
export function assertBreakStatement(node: Object, opts?: Object = {}): void {
  assert("BreakStatement", node, opts);
}
export function assertCallExpression(node: Object, opts?: Object = {}): void {
  assert("CallExpression", node, opts);
}
export function assertCatchClause(node: Object, opts?: Object = {}): void {
  assert("CatchClause", node, opts);
}
export function assertConditionalExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("ConditionalExpression", node, opts);
}
export function assertContinueStatement(
  node: Object,
  opts?: Object = {},
): void {
  assert("ContinueStatement", node, opts);
}
export function assertDebuggerStatement(
  node: Object,
  opts?: Object = {},
): void {
  assert("DebuggerStatement", node, opts);
}
export function assertDoWhileStatement(node: Object, opts?: Object = {}): void {
  assert("DoWhileStatement", node, opts);
}
export function assertEmptyStatement(node: Object, opts?: Object = {}): void {
  assert("EmptyStatement", node, opts);
}
export function assertExpressionStatement(
  node: Object,
  opts?: Object = {},
): void {
  assert("ExpressionStatement", node, opts);
}
export function assertFile(node: Object, opts?: Object = {}): void {
  assert("File", node, opts);
}
export function assertForInStatement(node: Object, opts?: Object = {}): void {
  assert("ForInStatement", node, opts);
}
export function assertForStatement(node: Object, opts?: Object = {}): void {
  assert("ForStatement", node, opts);
}
export function assertFunctionDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("FunctionDeclaration", node, opts);
}
export function assertFunctionExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("FunctionExpression", node, opts);
}
export function assertIdentifier(node: Object, opts?: Object = {}): void {
  assert("Identifier", node, opts);
}
export function assertIfStatement(node: Object, opts?: Object = {}): void {
  assert("IfStatement", node, opts);
}
export function assertLabeledStatement(node: Object, opts?: Object = {}): void {
  assert("LabeledStatement", node, opts);
}
export function assertStringLiteral(node: Object, opts?: Object = {}): void {
  assert("StringLiteral", node, opts);
}
export function assertNumericLiteral(node: Object, opts?: Object = {}): void {
  assert("NumericLiteral", node, opts);
}
export function assertNullLiteral(node: Object, opts?: Object = {}): void {
  assert("NullLiteral", node, opts);
}
export function assertBooleanLiteral(node: Object, opts?: Object = {}): void {
  assert("BooleanLiteral", node, opts);
}
export function assertRegExpLiteral(node: Object, opts?: Object = {}): void {
  assert("RegExpLiteral", node, opts);
}
export function assertLogicalExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("LogicalExpression", node, opts);
}
export function assertMemberExpression(node: Object, opts?: Object = {}): void {
  assert("MemberExpression", node, opts);
}
export function assertNewExpression(node: Object, opts?: Object = {}): void {
  assert("NewExpression", node, opts);
}
export function assertProgram(node: Object, opts?: Object = {}): void {
  assert("Program", node, opts);
}
export function assertObjectExpression(node: Object, opts?: Object = {}): void {
  assert("ObjectExpression", node, opts);
}
export function assertObjectMethod(node: Object, opts?: Object = {}): void {
  assert("ObjectMethod", node, opts);
}
export function assertObjectProperty(node: Object, opts?: Object = {}): void {
  assert("ObjectProperty", node, opts);
}
export function assertRestElement(node: Object, opts?: Object = {}): void {
  assert("RestElement", node, opts);
}
export function assertReturnStatement(node: Object, opts?: Object = {}): void {
  assert("ReturnStatement", node, opts);
}
export function assertSequenceExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("SequenceExpression", node, opts);
}
export function assertParenthesizedExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("ParenthesizedExpression", node, opts);
}
export function assertSwitchCase(node: Object, opts?: Object = {}): void {
  assert("SwitchCase", node, opts);
}
export function assertSwitchStatement(node: Object, opts?: Object = {}): void {
  assert("SwitchStatement", node, opts);
}
export function assertThisExpression(node: Object, opts?: Object = {}): void {
  assert("ThisExpression", node, opts);
}
export function assertThrowStatement(node: Object, opts?: Object = {}): void {
  assert("ThrowStatement", node, opts);
}
export function assertTryStatement(node: Object, opts?: Object = {}): void {
  assert("TryStatement", node, opts);
}
export function assertUnaryExpression(node: Object, opts?: Object = {}): void {
  assert("UnaryExpression", node, opts);
}
export function assertUpdateExpression(node: Object, opts?: Object = {}): void {
  assert("UpdateExpression", node, opts);
}
export function assertVariableDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("VariableDeclaration", node, opts);
}
export function assertVariableDeclarator(
  node: Object,
  opts?: Object = {},
): void {
  assert("VariableDeclarator", node, opts);
}
export function assertWhileStatement(node: Object, opts?: Object = {}): void {
  assert("WhileStatement", node, opts);
}
export function assertWithStatement(node: Object, opts?: Object = {}): void {
  assert("WithStatement", node, opts);
}
export function assertAssignmentPattern(
  node: Object,
  opts?: Object = {},
): void {
  assert("AssignmentPattern", node, opts);
}
export function assertArrayPattern(node: Object, opts?: Object = {}): void {
  assert("ArrayPattern", node, opts);
}
export function assertArrowFunctionExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("ArrowFunctionExpression", node, opts);
}
export function assertClassBody(node: Object, opts?: Object = {}): void {
  assert("ClassBody", node, opts);
}
export function assertClassExpression(node: Object, opts?: Object = {}): void {
  assert("ClassExpression", node, opts);
}
export function assertClassDeclaration(node: Object, opts?: Object = {}): void {
  assert("ClassDeclaration", node, opts);
}
export function assertExportAllDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("ExportAllDeclaration", node, opts);
}
export function assertExportDefaultDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("ExportDefaultDeclaration", node, opts);
}
export function assertExportNamedDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("ExportNamedDeclaration", node, opts);
}
export function assertExportSpecifier(node: Object, opts?: Object = {}): void {
  assert("ExportSpecifier", node, opts);
}
export function assertForOfStatement(node: Object, opts?: Object = {}): void {
  assert("ForOfStatement", node, opts);
}
export function assertImportDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("ImportDeclaration", node, opts);
}
export function assertImportDefaultSpecifier(
  node: Object,
  opts?: Object = {},
): void {
  assert("ImportDefaultSpecifier", node, opts);
}
export function assertImportNamespaceSpecifier(
  node: Object,
  opts?: Object = {},
): void {
  assert("ImportNamespaceSpecifier", node, opts);
}
export function assertImportSpecifier(node: Object, opts?: Object = {}): void {
  assert("ImportSpecifier", node, opts);
}
export function assertMetaProperty(node: Object, opts?: Object = {}): void {
  assert("MetaProperty", node, opts);
}
export function assertClassMethod(node: Object, opts?: Object = {}): void {
  assert("ClassMethod", node, opts);
}
export function assertObjectPattern(node: Object, opts?: Object = {}): void {
  assert("ObjectPattern", node, opts);
}
export function assertSpreadElement(node: Object, opts?: Object = {}): void {
  assert("SpreadElement", node, opts);
}
export function assertSuper(node: Object, opts?: Object = {}): void {
  assert("Super", node, opts);
}
export function assertTaggedTemplateExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("TaggedTemplateExpression", node, opts);
}
export function assertTemplateElement(node: Object, opts?: Object = {}): void {
  assert("TemplateElement", node, opts);
}
export function assertTemplateLiteral(node: Object, opts?: Object = {}): void {
  assert("TemplateLiteral", node, opts);
}
export function assertYieldExpression(node: Object, opts?: Object = {}): void {
  assert("YieldExpression", node, opts);
}
export function assertAnyTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("AnyTypeAnnotation", node, opts);
}
export function assertArrayTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("ArrayTypeAnnotation", node, opts);
}
export function assertBooleanTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("BooleanTypeAnnotation", node, opts);
}
export function assertBooleanLiteralTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("BooleanLiteralTypeAnnotation", node, opts);
}
export function assertNullLiteralTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("NullLiteralTypeAnnotation", node, opts);
}
export function assertClassImplements(node: Object, opts?: Object = {}): void {
  assert("ClassImplements", node, opts);
}
export function assertDeclareClass(node: Object, opts?: Object = {}): void {
  assert("DeclareClass", node, opts);
}
export function assertDeclareFunction(node: Object, opts?: Object = {}): void {
  assert("DeclareFunction", node, opts);
}
export function assertDeclareInterface(node: Object, opts?: Object = {}): void {
  assert("DeclareInterface", node, opts);
}
export function assertDeclareModule(node: Object, opts?: Object = {}): void {
  assert("DeclareModule", node, opts);
}
export function assertDeclareModuleExports(
  node: Object,
  opts?: Object = {},
): void {
  assert("DeclareModuleExports", node, opts);
}
export function assertDeclareTypeAlias(node: Object, opts?: Object = {}): void {
  assert("DeclareTypeAlias", node, opts);
}
export function assertDeclareOpaqueType(
  node: Object,
  opts?: Object = {},
): void {
  assert("DeclareOpaqueType", node, opts);
}
export function assertDeclareVariable(node: Object, opts?: Object = {}): void {
  assert("DeclareVariable", node, opts);
}
export function assertDeclareExportDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("DeclareExportDeclaration", node, opts);
}
export function assertDeclareExportAllDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("DeclareExportAllDeclaration", node, opts);
}
export function assertDeclaredPredicate(
  node: Object,
  opts?: Object = {},
): void {
  assert("DeclaredPredicate", node, opts);
}
export function assertExistsTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("ExistsTypeAnnotation", node, opts);
}
export function assertFunctionTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("FunctionTypeAnnotation", node, opts);
}
export function assertFunctionTypeParam(
  node: Object,
  opts?: Object = {},
): void {
  assert("FunctionTypeParam", node, opts);
}
export function assertGenericTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("GenericTypeAnnotation", node, opts);
}
export function assertInferredPredicate(
  node: Object,
  opts?: Object = {},
): void {
  assert("InferredPredicate", node, opts);
}
export function assertInterfaceExtends(node: Object, opts?: Object = {}): void {
  assert("InterfaceExtends", node, opts);
}
export function assertInterfaceDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("InterfaceDeclaration", node, opts);
}
export function assertInterfaceTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("InterfaceTypeAnnotation", node, opts);
}
export function assertIntersectionTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("IntersectionTypeAnnotation", node, opts);
}
export function assertMixedTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("MixedTypeAnnotation", node, opts);
}
export function assertEmptyTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("EmptyTypeAnnotation", node, opts);
}
export function assertNullableTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("NullableTypeAnnotation", node, opts);
}
export function assertNumberLiteralTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("NumberLiteralTypeAnnotation", node, opts);
}
export function assertNumberTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("NumberTypeAnnotation", node, opts);
}
export function assertObjectTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("ObjectTypeAnnotation", node, opts);
}
export function assertObjectTypeInternalSlot(
  node: Object,
  opts?: Object = {},
): void {
  assert("ObjectTypeInternalSlot", node, opts);
}
export function assertObjectTypeCallProperty(
  node: Object,
  opts?: Object = {},
): void {
  assert("ObjectTypeCallProperty", node, opts);
}
export function assertObjectTypeIndexer(
  node: Object,
  opts?: Object = {},
): void {
  assert("ObjectTypeIndexer", node, opts);
}
export function assertObjectTypeProperty(
  node: Object,
  opts?: Object = {},
): void {
  assert("ObjectTypeProperty", node, opts);
}
export function assertObjectTypeSpreadProperty(
  node: Object,
  opts?: Object = {},
): void {
  assert("ObjectTypeSpreadProperty", node, opts);
}
export function assertOpaqueType(node: Object, opts?: Object = {}): void {
  assert("OpaqueType", node, opts);
}
export function assertQualifiedTypeIdentifier(
  node: Object,
  opts?: Object = {},
): void {
  assert("QualifiedTypeIdentifier", node, opts);
}
export function assertStringLiteralTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("StringLiteralTypeAnnotation", node, opts);
}
export function assertStringTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("StringTypeAnnotation", node, opts);
}
export function assertSymbolTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("SymbolTypeAnnotation", node, opts);
}
export function assertThisTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("ThisTypeAnnotation", node, opts);
}
export function assertTupleTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("TupleTypeAnnotation", node, opts);
}
export function assertTypeofTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("TypeofTypeAnnotation", node, opts);
}
export function assertTypeAlias(node: Object, opts?: Object = {}): void {
  assert("TypeAlias", node, opts);
}
export function assertTypeAnnotation(node: Object, opts?: Object = {}): void {
  assert("TypeAnnotation", node, opts);
}
export function assertTypeCastExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("TypeCastExpression", node, opts);
}
export function assertTypeParameter(node: Object, opts?: Object = {}): void {
  assert("TypeParameter", node, opts);
}
export function assertTypeParameterDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("TypeParameterDeclaration", node, opts);
}
export function assertTypeParameterInstantiation(
  node: Object,
  opts?: Object = {},
): void {
  assert("TypeParameterInstantiation", node, opts);
}
export function assertUnionTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("UnionTypeAnnotation", node, opts);
}
export function assertVariance(node: Object, opts?: Object = {}): void {
  assert("Variance", node, opts);
}
export function assertVoidTypeAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("VoidTypeAnnotation", node, opts);
}
export function assertEnumDeclaration(node: Object, opts?: Object = {}): void {
  assert("EnumDeclaration", node, opts);
}
export function assertEnumBooleanBody(node: Object, opts?: Object = {}): void {
  assert("EnumBooleanBody", node, opts);
}
export function assertEnumNumberBody(node: Object, opts?: Object = {}): void {
  assert("EnumNumberBody", node, opts);
}
export function assertEnumStringBody(node: Object, opts?: Object = {}): void {
  assert("EnumStringBody", node, opts);
}
export function assertEnumSymbolBody(node: Object, opts?: Object = {}): void {
  assert("EnumSymbolBody", node, opts);
}
export function assertEnumBooleanMember(
  node: Object,
  opts?: Object = {},
): void {
  assert("EnumBooleanMember", node, opts);
}
export function assertEnumNumberMember(node: Object, opts?: Object = {}): void {
  assert("EnumNumberMember", node, opts);
}
export function assertEnumStringMember(node: Object, opts?: Object = {}): void {
  assert("EnumStringMember", node, opts);
}
export function assertEnumDefaultedMember(
  node: Object,
  opts?: Object = {},
): void {
  assert("EnumDefaultedMember", node, opts);
}
export function assertJSXAttribute(node: Object, opts?: Object = {}): void {
  assert("JSXAttribute", node, opts);
}
export function assertJSXClosingElement(
  node: Object,
  opts?: Object = {},
): void {
  assert("JSXClosingElement", node, opts);
}
export function assertJSXElement(node: Object, opts?: Object = {}): void {
  assert("JSXElement", node, opts);
}
export function assertJSXEmptyExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("JSXEmptyExpression", node, opts);
}
export function assertJSXExpressionContainer(
  node: Object,
  opts?: Object = {},
): void {
  assert("JSXExpressionContainer", node, opts);
}
export function assertJSXSpreadChild(node: Object, opts?: Object = {}): void {
  assert("JSXSpreadChild", node, opts);
}
export function assertJSXIdentifier(node: Object, opts?: Object = {}): void {
  assert("JSXIdentifier", node, opts);
}
export function assertJSXMemberExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("JSXMemberExpression", node, opts);
}
export function assertJSXNamespacedName(
  node: Object,
  opts?: Object = {},
): void {
  assert("JSXNamespacedName", node, opts);
}
export function assertJSXOpeningElement(
  node: Object,
  opts?: Object = {},
): void {
  assert("JSXOpeningElement", node, opts);
}
export function assertJSXSpreadAttribute(
  node: Object,
  opts?: Object = {},
): void {
  assert("JSXSpreadAttribute", node, opts);
}
export function assertJSXText(node: Object, opts?: Object = {}): void {
  assert("JSXText", node, opts);
}
export function assertJSXFragment(node: Object, opts?: Object = {}): void {
  assert("JSXFragment", node, opts);
}
export function assertJSXOpeningFragment(
  node: Object,
  opts?: Object = {},
): void {
  assert("JSXOpeningFragment", node, opts);
}
export function assertJSXClosingFragment(
  node: Object,
  opts?: Object = {},
): void {
  assert("JSXClosingFragment", node, opts);
}
export function assertNoop(node: Object, opts?: Object = {}): void {
  assert("Noop", node, opts);
}
export function assertPlaceholder(node: Object, opts?: Object = {}): void {
  assert("Placeholder", node, opts);
}
export function assertV8IntrinsicIdentifier(
  node: Object,
  opts?: Object = {},
): void {
  assert("V8IntrinsicIdentifier", node, opts);
}
export function assertArgumentPlaceholder(
  node: Object,
  opts?: Object = {},
): void {
  assert("ArgumentPlaceholder", node, opts);
}
export function assertAwaitExpression(node: Object, opts?: Object = {}): void {
  assert("AwaitExpression", node, opts);
}
export function assertBindExpression(node: Object, opts?: Object = {}): void {
  assert("BindExpression", node, opts);
}
export function assertClassProperty(node: Object, opts?: Object = {}): void {
  assert("ClassProperty", node, opts);
}
export function assertEventualMemberExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("EventualMemberExpression", node, opts);
}
export function assertEventualMemberCallExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("EventualMemberCallExpression", node, opts);
}
export function assertOptionalMemberExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("OptionalMemberExpression", node, opts);
}
export function assertPipelineTopicExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("PipelineTopicExpression", node, opts);
}
export function assertPipelineBareFunction(
  node: Object,
  opts?: Object = {},
): void {
  assert("PipelineBareFunction", node, opts);
}
export function assertPipelinePrimaryTopicReference(
  node: Object,
  opts?: Object = {},
): void {
  assert("PipelinePrimaryTopicReference", node, opts);
}
export function assertEventualCallExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("EventualCallExpression", node, opts);
}
export function assertOptionalCallExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("OptionalCallExpression", node, opts);
}
export function assertClassPrivateProperty(
  node: Object,
  opts?: Object = {},
): void {
  assert("ClassPrivateProperty", node, opts);
}
export function assertClassPrivateMethod(
  node: Object,
  opts?: Object = {},
): void {
  assert("ClassPrivateMethod", node, opts);
}
export function assertImport(node: Object, opts?: Object = {}): void {
  assert("Import", node, opts);
}
export function assertImportAttribute(node: Object, opts?: Object = {}): void {
  assert("ImportAttribute", node, opts);
}
export function assertDecorator(node: Object, opts?: Object = {}): void {
  assert("Decorator", node, opts);
}
export function assertDoExpression(node: Object, opts?: Object = {}): void {
  assert("DoExpression", node, opts);
}
export function assertExportDefaultSpecifier(
  node: Object,
  opts?: Object = {},
): void {
  assert("ExportDefaultSpecifier", node, opts);
}
export function assertExportNamespaceSpecifier(
  node: Object,
  opts?: Object = {},
): void {
  assert("ExportNamespaceSpecifier", node, opts);
}
export function assertPrivateName(node: Object, opts?: Object = {}): void {
  assert("PrivateName", node, opts);
}
export function assertBigIntLiteral(node: Object, opts?: Object = {}): void {
  assert("BigIntLiteral", node, opts);
}
export function assertRecordExpression(node: Object, opts?: Object = {}): void {
  assert("RecordExpression", node, opts);
}
export function assertTupleExpression(node: Object, opts?: Object = {}): void {
  assert("TupleExpression", node, opts);
}
export function assertTSParameterProperty(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSParameterProperty", node, opts);
}
export function assertTSDeclareFunction(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSDeclareFunction", node, opts);
}
export function assertTSDeclareMethod(node: Object, opts?: Object = {}): void {
  assert("TSDeclareMethod", node, opts);
}
export function assertTSQualifiedName(node: Object, opts?: Object = {}): void {
  assert("TSQualifiedName", node, opts);
}
export function assertTSCallSignatureDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSCallSignatureDeclaration", node, opts);
}
export function assertTSConstructSignatureDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSConstructSignatureDeclaration", node, opts);
}
export function assertTSPropertySignature(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSPropertySignature", node, opts);
}
export function assertTSMethodSignature(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSMethodSignature", node, opts);
}
export function assertTSIndexSignature(node: Object, opts?: Object = {}): void {
  assert("TSIndexSignature", node, opts);
}
export function assertTSAnyKeyword(node: Object, opts?: Object = {}): void {
  assert("TSAnyKeyword", node, opts);
}
export function assertTSBooleanKeyword(node: Object, opts?: Object = {}): void {
  assert("TSBooleanKeyword", node, opts);
}
export function assertTSBigIntKeyword(node: Object, opts?: Object = {}): void {
  assert("TSBigIntKeyword", node, opts);
}
export function assertTSNeverKeyword(node: Object, opts?: Object = {}): void {
  assert("TSNeverKeyword", node, opts);
}
export function assertTSNullKeyword(node: Object, opts?: Object = {}): void {
  assert("TSNullKeyword", node, opts);
}
export function assertTSNumberKeyword(node: Object, opts?: Object = {}): void {
  assert("TSNumberKeyword", node, opts);
}
export function assertTSObjectKeyword(node: Object, opts?: Object = {}): void {
  assert("TSObjectKeyword", node, opts);
}
export function assertTSStringKeyword(node: Object, opts?: Object = {}): void {
  assert("TSStringKeyword", node, opts);
}
export function assertTSSymbolKeyword(node: Object, opts?: Object = {}): void {
  assert("TSSymbolKeyword", node, opts);
}
export function assertTSUndefinedKeyword(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSUndefinedKeyword", node, opts);
}
export function assertTSUnknownKeyword(node: Object, opts?: Object = {}): void {
  assert("TSUnknownKeyword", node, opts);
}
export function assertTSVoidKeyword(node: Object, opts?: Object = {}): void {
  assert("TSVoidKeyword", node, opts);
}
export function assertTSThisType(node: Object, opts?: Object = {}): void {
  assert("TSThisType", node, opts);
}
export function assertTSFunctionType(node: Object, opts?: Object = {}): void {
  assert("TSFunctionType", node, opts);
}
export function assertTSConstructorType(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSConstructorType", node, opts);
}
export function assertTSTypeReference(node: Object, opts?: Object = {}): void {
  assert("TSTypeReference", node, opts);
}
export function assertTSTypePredicate(node: Object, opts?: Object = {}): void {
  assert("TSTypePredicate", node, opts);
}
export function assertTSTypeQuery(node: Object, opts?: Object = {}): void {
  assert("TSTypeQuery", node, opts);
}
export function assertTSTypeLiteral(node: Object, opts?: Object = {}): void {
  assert("TSTypeLiteral", node, opts);
}
export function assertTSArrayType(node: Object, opts?: Object = {}): void {
  assert("TSArrayType", node, opts);
}
export function assertTSTupleType(node: Object, opts?: Object = {}): void {
  assert("TSTupleType", node, opts);
}
export function assertTSOptionalType(node: Object, opts?: Object = {}): void {
  assert("TSOptionalType", node, opts);
}
export function assertTSRestType(node: Object, opts?: Object = {}): void {
  assert("TSRestType", node, opts);
}
export function assertTSUnionType(node: Object, opts?: Object = {}): void {
  assert("TSUnionType", node, opts);
}
export function assertTSIntersectionType(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSIntersectionType", node, opts);
}
export function assertTSConditionalType(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSConditionalType", node, opts);
}
export function assertTSInferType(node: Object, opts?: Object = {}): void {
  assert("TSInferType", node, opts);
}
export function assertTSParenthesizedType(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSParenthesizedType", node, opts);
}
export function assertTSTypeOperator(node: Object, opts?: Object = {}): void {
  assert("TSTypeOperator", node, opts);
}
export function assertTSIndexedAccessType(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSIndexedAccessType", node, opts);
}
export function assertTSMappedType(node: Object, opts?: Object = {}): void {
  assert("TSMappedType", node, opts);
}
export function assertTSLiteralType(node: Object, opts?: Object = {}): void {
  assert("TSLiteralType", node, opts);
}
export function assertTSExpressionWithTypeArguments(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSExpressionWithTypeArguments", node, opts);
}
export function assertTSInterfaceDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSInterfaceDeclaration", node, opts);
}
export function assertTSInterfaceBody(node: Object, opts?: Object = {}): void {
  assert("TSInterfaceBody", node, opts);
}
export function assertTSTypeAliasDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSTypeAliasDeclaration", node, opts);
}
export function assertTSAsExpression(node: Object, opts?: Object = {}): void {
  assert("TSAsExpression", node, opts);
}
export function assertTSTypeAssertion(node: Object, opts?: Object = {}): void {
  assert("TSTypeAssertion", node, opts);
}
export function assertTSEnumDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSEnumDeclaration", node, opts);
}
export function assertTSEnumMember(node: Object, opts?: Object = {}): void {
  assert("TSEnumMember", node, opts);
}
export function assertTSModuleDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSModuleDeclaration", node, opts);
}
export function assertTSModuleBlock(node: Object, opts?: Object = {}): void {
  assert("TSModuleBlock", node, opts);
}
export function assertTSImportType(node: Object, opts?: Object = {}): void {
  assert("TSImportType", node, opts);
}
export function assertTSImportEqualsDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSImportEqualsDeclaration", node, opts);
}
export function assertTSExternalModuleReference(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSExternalModuleReference", node, opts);
}
export function assertTSNonNullExpression(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSNonNullExpression", node, opts);
}
export function assertTSExportAssignment(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSExportAssignment", node, opts);
}
export function assertTSNamespaceExportDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSNamespaceExportDeclaration", node, opts);
}
export function assertTSTypeAnnotation(node: Object, opts?: Object = {}): void {
  assert("TSTypeAnnotation", node, opts);
}
export function assertTSTypeParameterInstantiation(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSTypeParameterInstantiation", node, opts);
}
export function assertTSTypeParameterDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("TSTypeParameterDeclaration", node, opts);
}
export function assertTSTypeParameter(node: Object, opts?: Object = {}): void {
  assert("TSTypeParameter", node, opts);
}
export function assertExpression(node: Object, opts?: Object = {}): void {
  assert("Expression", node, opts);
}
export function assertBinary(node: Object, opts?: Object = {}): void {
  assert("Binary", node, opts);
}
export function assertScopable(node: Object, opts?: Object = {}): void {
  assert("Scopable", node, opts);
}
export function assertBlockParent(node: Object, opts?: Object = {}): void {
  assert("BlockParent", node, opts);
}
export function assertBlock(node: Object, opts?: Object = {}): void {
  assert("Block", node, opts);
}
export function assertStatement(node: Object, opts?: Object = {}): void {
  assert("Statement", node, opts);
}
export function assertTerminatorless(node: Object, opts?: Object = {}): void {
  assert("Terminatorless", node, opts);
}
export function assertCompletionStatement(
  node: Object,
  opts?: Object = {},
): void {
  assert("CompletionStatement", node, opts);
}
export function assertConditional(node: Object, opts?: Object = {}): void {
  assert("Conditional", node, opts);
}
export function assertLoop(node: Object, opts?: Object = {}): void {
  assert("Loop", node, opts);
}
export function assertWhile(node: Object, opts?: Object = {}): void {
  assert("While", node, opts);
}
export function assertExpressionWrapper(
  node: Object,
  opts?: Object = {},
): void {
  assert("ExpressionWrapper", node, opts);
}
export function assertFor(node: Object, opts?: Object = {}): void {
  assert("For", node, opts);
}
export function assertForXStatement(node: Object, opts?: Object = {}): void {
  assert("ForXStatement", node, opts);
}
export function assertFunction(node: Object, opts?: Object = {}): void {
  assert("Function", node, opts);
}
export function assertFunctionParent(node: Object, opts?: Object = {}): void {
  assert("FunctionParent", node, opts);
}
export function assertPureish(node: Object, opts?: Object = {}): void {
  assert("Pureish", node, opts);
}
export function assertDeclaration(node: Object, opts?: Object = {}): void {
  assert("Declaration", node, opts);
}
export function assertPatternLike(node: Object, opts?: Object = {}): void {
  assert("PatternLike", node, opts);
}
export function assertLVal(node: Object, opts?: Object = {}): void {
  assert("LVal", node, opts);
}
export function assertTSEntityName(node: Object, opts?: Object = {}): void {
  assert("TSEntityName", node, opts);
}
export function assertLiteral(node: Object, opts?: Object = {}): void {
  assert("Literal", node, opts);
}
export function assertImmutable(node: Object, opts?: Object = {}): void {
  assert("Immutable", node, opts);
}
export function assertUserWhitespacable(
  node: Object,
  opts?: Object = {},
): void {
  assert("UserWhitespacable", node, opts);
}
export function assertMethod(node: Object, opts?: Object = {}): void {
  assert("Method", node, opts);
}
export function assertObjectMember(node: Object, opts?: Object = {}): void {
  assert("ObjectMember", node, opts);
}
export function assertProperty(node: Object, opts?: Object = {}): void {
  assert("Property", node, opts);
}
export function assertUnaryLike(node: Object, opts?: Object = {}): void {
  assert("UnaryLike", node, opts);
}
export function assertPattern(node: Object, opts?: Object = {}): void {
  assert("Pattern", node, opts);
}
export function assertClass(node: Object, opts?: Object = {}): void {
  assert("Class", node, opts);
}
export function assertModuleDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("ModuleDeclaration", node, opts);
}
export function assertExportDeclaration(
  node: Object,
  opts?: Object = {},
): void {
  assert("ExportDeclaration", node, opts);
}
export function assertModuleSpecifier(node: Object, opts?: Object = {}): void {
  assert("ModuleSpecifier", node, opts);
}
export function assertFlow(node: Object, opts?: Object = {}): void {
  assert("Flow", node, opts);
}
export function assertFlowType(node: Object, opts?: Object = {}): void {
  assert("FlowType", node, opts);
}
export function assertFlowBaseAnnotation(
  node: Object,
  opts?: Object = {},
): void {
  assert("FlowBaseAnnotation", node, opts);
}
export function assertFlowDeclaration(node: Object, opts?: Object = {}): void {
  assert("FlowDeclaration", node, opts);
}
export function assertFlowPredicate(node: Object, opts?: Object = {}): void {
  assert("FlowPredicate", node, opts);
}
export function assertEnumBody(node: Object, opts?: Object = {}): void {
  assert("EnumBody", node, opts);
}
export function assertEnumMember(node: Object, opts?: Object = {}): void {
  assert("EnumMember", node, opts);
}
export function assertJSX(node: Object, opts?: Object = {}): void {
  assert("JSX", node, opts);
}
export function assertPrivate(node: Object, opts?: Object = {}): void {
  assert("Private", node, opts);
}
export function assertTSTypeElement(node: Object, opts?: Object = {}): void {
  assert("TSTypeElement", node, opts);
}
export function assertTSType(node: Object, opts?: Object = {}): void {
  assert("TSType", node, opts);
}
export function assertTSBaseType(node: Object, opts?: Object = {}): void {
  assert("TSBaseType", node, opts);
}
export function assertNumberLiteral(node: Object, opts: Object): void {
  console.trace(
    "The node type NumberLiteral has been renamed to NumericLiteral",
  );
  assert("NumberLiteral", node, opts);
}
export function assertRegexLiteral(node: Object, opts: Object): void {
  console.trace("The node type RegexLiteral has been renamed to RegExpLiteral");
  assert("RegexLiteral", node, opts);
}
export function assertRestProperty(node: Object, opts: Object): void {
  console.trace("The node type RestProperty has been renamed to RestElement");
  assert("RestProperty", node, opts);
}
export function assertSpreadProperty(node: Object, opts: Object): void {
  console.trace(
    "The node type SpreadProperty has been renamed to SpreadElement",
  );
  assert("SpreadProperty", node, opts);
}
