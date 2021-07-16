/*
 * This file is auto-generated! Do not modify it directly.
 * To re-generate run 'make build'
 */
import is from "../../validators/is";
import type * as t from "../..";

function assert(type: string, node: any, opts?: any): void {
  if (!is(type, node, opts)) {
    throw new Error(
      `Expected type "${type}" with option ${JSON.stringify(opts)}, ` +
        `but instead got "${node.type}".`,
    );
  }
}

export function assertArrayExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ArrayExpression {
  assert("ArrayExpression", node, opts);
}
export function assertAssignmentExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.AssignmentExpression {
  assert("AssignmentExpression", node, opts);
}
export function assertBinaryExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.BinaryExpression {
  assert("BinaryExpression", node, opts);
}
export function assertInterpreterDirective(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.InterpreterDirective {
  assert("InterpreterDirective", node, opts);
}
export function assertDirective(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Directive {
  assert("Directive", node, opts);
}
export function assertDirectiveLiteral(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DirectiveLiteral {
  assert("DirectiveLiteral", node, opts);
}
export function assertBlockStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.BlockStatement {
  assert("BlockStatement", node, opts);
}
export function assertBreakStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.BreakStatement {
  assert("BreakStatement", node, opts);
}
export function assertCallExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.CallExpression {
  assert("CallExpression", node, opts);
}
export function assertCatchClause(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.CatchClause {
  assert("CatchClause", node, opts);
}
export function assertConditionalExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ConditionalExpression {
  assert("ConditionalExpression", node, opts);
}
export function assertContinueStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ContinueStatement {
  assert("ContinueStatement", node, opts);
}
export function assertDebuggerStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DebuggerStatement {
  assert("DebuggerStatement", node, opts);
}
export function assertDoWhileStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DoWhileStatement {
  assert("DoWhileStatement", node, opts);
}
export function assertEmptyStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.EmptyStatement {
  assert("EmptyStatement", node, opts);
}
export function assertExpressionStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ExpressionStatement {
  assert("ExpressionStatement", node, opts);
}
export function assertFile(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.File {
  assert("File", node, opts);
}
export function assertForInStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ForInStatement {
  assert("ForInStatement", node, opts);
}
export function assertForStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ForStatement {
  assert("ForStatement", node, opts);
}
export function assertFunctionDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.FunctionDeclaration {
  assert("FunctionDeclaration", node, opts);
}
export function assertFunctionExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.FunctionExpression {
  assert("FunctionExpression", node, opts);
}
export function assertIdentifier(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Identifier {
  assert("Identifier", node, opts);
}
export function assertIfStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.IfStatement {
  assert("IfStatement", node, opts);
}
export function assertLabeledStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.LabeledStatement {
  assert("LabeledStatement", node, opts);
}
export function assertStringLiteral(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.StringLiteral {
  assert("StringLiteral", node, opts);
}
export function assertNumericLiteral(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.NumericLiteral {
  assert("NumericLiteral", node, opts);
}
export function assertNullLiteral(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.NullLiteral {
  assert("NullLiteral", node, opts);
}
export function assertBooleanLiteral(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.BooleanLiteral {
  assert("BooleanLiteral", node, opts);
}
export function assertRegExpLiteral(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.RegExpLiteral {
  assert("RegExpLiteral", node, opts);
}
export function assertLogicalExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.LogicalExpression {
  assert("LogicalExpression", node, opts);
}
export function assertMemberExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.MemberExpression {
  assert("MemberExpression", node, opts);
}
export function assertNewExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.NewExpression {
  assert("NewExpression", node, opts);
}
export function assertProgram(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Program {
  assert("Program", node, opts);
}
export function assertObjectExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ObjectExpression {
  assert("ObjectExpression", node, opts);
}
export function assertObjectMethod(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ObjectMethod {
  assert("ObjectMethod", node, opts);
}
export function assertObjectProperty(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ObjectProperty {
  assert("ObjectProperty", node, opts);
}
export function assertRestElement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.RestElement {
  assert("RestElement", node, opts);
}
export function assertReturnStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ReturnStatement {
  assert("ReturnStatement", node, opts);
}
export function assertSequenceExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.SequenceExpression {
  assert("SequenceExpression", node, opts);
}
export function assertParenthesizedExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ParenthesizedExpression {
  assert("ParenthesizedExpression", node, opts);
}
export function assertSwitchCase(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.SwitchCase {
  assert("SwitchCase", node, opts);
}
export function assertSwitchStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.SwitchStatement {
  assert("SwitchStatement", node, opts);
}
export function assertThisExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ThisExpression {
  assert("ThisExpression", node, opts);
}
export function assertThrowStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ThrowStatement {
  assert("ThrowStatement", node, opts);
}
export function assertTryStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TryStatement {
  assert("TryStatement", node, opts);
}
export function assertUnaryExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.UnaryExpression {
  assert("UnaryExpression", node, opts);
}
export function assertUpdateExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.UpdateExpression {
  assert("UpdateExpression", node, opts);
}
export function assertVariableDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.VariableDeclaration {
  assert("VariableDeclaration", node, opts);
}
export function assertVariableDeclarator(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.VariableDeclarator {
  assert("VariableDeclarator", node, opts);
}
export function assertWhileStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.WhileStatement {
  assert("WhileStatement", node, opts);
}
export function assertWithStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.WithStatement {
  assert("WithStatement", node, opts);
}
export function assertAssignmentPattern(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.AssignmentPattern {
  assert("AssignmentPattern", node, opts);
}
export function assertArrayPattern(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ArrayPattern {
  assert("ArrayPattern", node, opts);
}
export function assertArrowFunctionExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ArrowFunctionExpression {
  assert("ArrowFunctionExpression", node, opts);
}
export function assertClassBody(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ClassBody {
  assert("ClassBody", node, opts);
}
export function assertClassExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ClassExpression {
  assert("ClassExpression", node, opts);
}
export function assertClassDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ClassDeclaration {
  assert("ClassDeclaration", node, opts);
}
export function assertExportAllDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ExportAllDeclaration {
  assert("ExportAllDeclaration", node, opts);
}
export function assertExportDefaultDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ExportDefaultDeclaration {
  assert("ExportDefaultDeclaration", node, opts);
}
export function assertExportNamedDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ExportNamedDeclaration {
  assert("ExportNamedDeclaration", node, opts);
}
export function assertExportSpecifier(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ExportSpecifier {
  assert("ExportSpecifier", node, opts);
}
export function assertForOfStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ForOfStatement {
  assert("ForOfStatement", node, opts);
}
export function assertImportDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ImportDeclaration {
  assert("ImportDeclaration", node, opts);
}
export function assertImportDefaultSpecifier(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ImportDefaultSpecifier {
  assert("ImportDefaultSpecifier", node, opts);
}
export function assertImportNamespaceSpecifier(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ImportNamespaceSpecifier {
  assert("ImportNamespaceSpecifier", node, opts);
}
export function assertImportSpecifier(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ImportSpecifier {
  assert("ImportSpecifier", node, opts);
}
export function assertMetaProperty(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.MetaProperty {
  assert("MetaProperty", node, opts);
}
export function assertClassMethod(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ClassMethod {
  assert("ClassMethod", node, opts);
}
export function assertObjectPattern(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ObjectPattern {
  assert("ObjectPattern", node, opts);
}
export function assertSpreadElement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.SpreadElement {
  assert("SpreadElement", node, opts);
}
export function assertSuper(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Super {
  assert("Super", node, opts);
}
export function assertTaggedTemplateExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TaggedTemplateExpression {
  assert("TaggedTemplateExpression", node, opts);
}
export function assertTemplateElement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TemplateElement {
  assert("TemplateElement", node, opts);
}
export function assertTemplateLiteral(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TemplateLiteral {
  assert("TemplateLiteral", node, opts);
}
export function assertYieldExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.YieldExpression {
  assert("YieldExpression", node, opts);
}
export function assertAwaitExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.AwaitExpression {
  assert("AwaitExpression", node, opts);
}
export function assertImport(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Import {
  assert("Import", node, opts);
}
export function assertBigIntLiteral(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.BigIntLiteral {
  assert("BigIntLiteral", node, opts);
}
export function assertExportNamespaceSpecifier(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ExportNamespaceSpecifier {
  assert("ExportNamespaceSpecifier", node, opts);
}
export function assertOptionalMemberExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.OptionalMemberExpression {
  assert("OptionalMemberExpression", node, opts);
}
export function assertOptionalCallExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.OptionalCallExpression {
  assert("OptionalCallExpression", node, opts);
}
export function assertClassProperty(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ClassProperty {
  assert("ClassProperty", node, opts);
}
export function assertClassPrivateProperty(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ClassPrivateProperty {
  assert("ClassPrivateProperty", node, opts);
}
export function assertClassPrivateMethod(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ClassPrivateMethod {
  assert("ClassPrivateMethod", node, opts);
}
export function assertPrivateName(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.PrivateName {
  assert("PrivateName", node, opts);
}
export function assertAnyTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.AnyTypeAnnotation {
  assert("AnyTypeAnnotation", node, opts);
}
export function assertArrayTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ArrayTypeAnnotation {
  assert("ArrayTypeAnnotation", node, opts);
}
export function assertBooleanTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.BooleanTypeAnnotation {
  assert("BooleanTypeAnnotation", node, opts);
}
export function assertBooleanLiteralTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.BooleanLiteralTypeAnnotation {
  assert("BooleanLiteralTypeAnnotation", node, opts);
}
export function assertNullLiteralTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.NullLiteralTypeAnnotation {
  assert("NullLiteralTypeAnnotation", node, opts);
}
export function assertClassImplements(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ClassImplements {
  assert("ClassImplements", node, opts);
}
export function assertDeclareClass(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DeclareClass {
  assert("DeclareClass", node, opts);
}
export function assertDeclareFunction(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DeclareFunction {
  assert("DeclareFunction", node, opts);
}
export function assertDeclareInterface(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DeclareInterface {
  assert("DeclareInterface", node, opts);
}
export function assertDeclareModule(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DeclareModule {
  assert("DeclareModule", node, opts);
}
export function assertDeclareModuleExports(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DeclareModuleExports {
  assert("DeclareModuleExports", node, opts);
}
export function assertDeclareTypeAlias(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DeclareTypeAlias {
  assert("DeclareTypeAlias", node, opts);
}
export function assertDeclareOpaqueType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DeclareOpaqueType {
  assert("DeclareOpaqueType", node, opts);
}
export function assertDeclareVariable(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DeclareVariable {
  assert("DeclareVariable", node, opts);
}
export function assertDeclareExportDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DeclareExportDeclaration {
  assert("DeclareExportDeclaration", node, opts);
}
export function assertDeclareExportAllDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DeclareExportAllDeclaration {
  assert("DeclareExportAllDeclaration", node, opts);
}
export function assertDeclaredPredicate(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DeclaredPredicate {
  assert("DeclaredPredicate", node, opts);
}
export function assertExistsTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ExistsTypeAnnotation {
  assert("ExistsTypeAnnotation", node, opts);
}
export function assertFunctionTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.FunctionTypeAnnotation {
  assert("FunctionTypeAnnotation", node, opts);
}
export function assertFunctionTypeParam(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.FunctionTypeParam {
  assert("FunctionTypeParam", node, opts);
}
export function assertGenericTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.GenericTypeAnnotation {
  assert("GenericTypeAnnotation", node, opts);
}
export function assertInferredPredicate(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.InferredPredicate {
  assert("InferredPredicate", node, opts);
}
export function assertInterfaceExtends(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.InterfaceExtends {
  assert("InterfaceExtends", node, opts);
}
export function assertInterfaceDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.InterfaceDeclaration {
  assert("InterfaceDeclaration", node, opts);
}
export function assertInterfaceTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.InterfaceTypeAnnotation {
  assert("InterfaceTypeAnnotation", node, opts);
}
export function assertIntersectionTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.IntersectionTypeAnnotation {
  assert("IntersectionTypeAnnotation", node, opts);
}
export function assertMixedTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.MixedTypeAnnotation {
  assert("MixedTypeAnnotation", node, opts);
}
export function assertEmptyTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.EmptyTypeAnnotation {
  assert("EmptyTypeAnnotation", node, opts);
}
export function assertNullableTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.NullableTypeAnnotation {
  assert("NullableTypeAnnotation", node, opts);
}
export function assertNumberLiteralTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.NumberLiteralTypeAnnotation {
  assert("NumberLiteralTypeAnnotation", node, opts);
}
export function assertNumberTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.NumberTypeAnnotation {
  assert("NumberTypeAnnotation", node, opts);
}
export function assertObjectTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ObjectTypeAnnotation {
  assert("ObjectTypeAnnotation", node, opts);
}
export function assertObjectTypeInternalSlot(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ObjectTypeInternalSlot {
  assert("ObjectTypeInternalSlot", node, opts);
}
export function assertObjectTypeCallProperty(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ObjectTypeCallProperty {
  assert("ObjectTypeCallProperty", node, opts);
}
export function assertObjectTypeIndexer(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ObjectTypeIndexer {
  assert("ObjectTypeIndexer", node, opts);
}
export function assertObjectTypeProperty(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ObjectTypeProperty {
  assert("ObjectTypeProperty", node, opts);
}
export function assertObjectTypeSpreadProperty(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ObjectTypeSpreadProperty {
  assert("ObjectTypeSpreadProperty", node, opts);
}
export function assertOpaqueType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.OpaqueType {
  assert("OpaqueType", node, opts);
}
export function assertQualifiedTypeIdentifier(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.QualifiedTypeIdentifier {
  assert("QualifiedTypeIdentifier", node, opts);
}
export function assertStringLiteralTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.StringLiteralTypeAnnotation {
  assert("StringLiteralTypeAnnotation", node, opts);
}
export function assertStringTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.StringTypeAnnotation {
  assert("StringTypeAnnotation", node, opts);
}
export function assertSymbolTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.SymbolTypeAnnotation {
  assert("SymbolTypeAnnotation", node, opts);
}
export function assertThisTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ThisTypeAnnotation {
  assert("ThisTypeAnnotation", node, opts);
}
export function assertTupleTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TupleTypeAnnotation {
  assert("TupleTypeAnnotation", node, opts);
}
export function assertTypeofTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TypeofTypeAnnotation {
  assert("TypeofTypeAnnotation", node, opts);
}
export function assertTypeAlias(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TypeAlias {
  assert("TypeAlias", node, opts);
}
export function assertTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TypeAnnotation {
  assert("TypeAnnotation", node, opts);
}
export function assertTypeCastExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TypeCastExpression {
  assert("TypeCastExpression", node, opts);
}
export function assertTypeParameter(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TypeParameter {
  assert("TypeParameter", node, opts);
}
export function assertTypeParameterDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TypeParameterDeclaration {
  assert("TypeParameterDeclaration", node, opts);
}
export function assertTypeParameterInstantiation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TypeParameterInstantiation {
  assert("TypeParameterInstantiation", node, opts);
}
export function assertUnionTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.UnionTypeAnnotation {
  assert("UnionTypeAnnotation", node, opts);
}
export function assertVariance(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Variance {
  assert("Variance", node, opts);
}
export function assertVoidTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.VoidTypeAnnotation {
  assert("VoidTypeAnnotation", node, opts);
}
export function assertEnumDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.EnumDeclaration {
  assert("EnumDeclaration", node, opts);
}
export function assertEnumBooleanBody(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.EnumBooleanBody {
  assert("EnumBooleanBody", node, opts);
}
export function assertEnumNumberBody(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.EnumNumberBody {
  assert("EnumNumberBody", node, opts);
}
export function assertEnumStringBody(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.EnumStringBody {
  assert("EnumStringBody", node, opts);
}
export function assertEnumSymbolBody(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.EnumSymbolBody {
  assert("EnumSymbolBody", node, opts);
}
export function assertEnumBooleanMember(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.EnumBooleanMember {
  assert("EnumBooleanMember", node, opts);
}
export function assertEnumNumberMember(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.EnumNumberMember {
  assert("EnumNumberMember", node, opts);
}
export function assertEnumStringMember(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.EnumStringMember {
  assert("EnumStringMember", node, opts);
}
export function assertEnumDefaultedMember(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.EnumDefaultedMember {
  assert("EnumDefaultedMember", node, opts);
}
export function assertIndexedAccessType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.IndexedAccessType {
  assert("IndexedAccessType", node, opts);
}
export function assertOptionalIndexedAccessType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.OptionalIndexedAccessType {
  assert("OptionalIndexedAccessType", node, opts);
}
export function assertJSXAttribute(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXAttribute {
  assert("JSXAttribute", node, opts);
}
export function assertJSXClosingElement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXClosingElement {
  assert("JSXClosingElement", node, opts);
}
export function assertJSXElement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXElement {
  assert("JSXElement", node, opts);
}
export function assertJSXEmptyExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXEmptyExpression {
  assert("JSXEmptyExpression", node, opts);
}
export function assertJSXExpressionContainer(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXExpressionContainer {
  assert("JSXExpressionContainer", node, opts);
}
export function assertJSXSpreadChild(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXSpreadChild {
  assert("JSXSpreadChild", node, opts);
}
export function assertJSXIdentifier(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXIdentifier {
  assert("JSXIdentifier", node, opts);
}
export function assertJSXMemberExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXMemberExpression {
  assert("JSXMemberExpression", node, opts);
}
export function assertJSXNamespacedName(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXNamespacedName {
  assert("JSXNamespacedName", node, opts);
}
export function assertJSXOpeningElement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXOpeningElement {
  assert("JSXOpeningElement", node, opts);
}
export function assertJSXSpreadAttribute(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXSpreadAttribute {
  assert("JSXSpreadAttribute", node, opts);
}
export function assertJSXText(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXText {
  assert("JSXText", node, opts);
}
export function assertJSXFragment(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXFragment {
  assert("JSXFragment", node, opts);
}
export function assertJSXOpeningFragment(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXOpeningFragment {
  assert("JSXOpeningFragment", node, opts);
}
export function assertJSXClosingFragment(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSXClosingFragment {
  assert("JSXClosingFragment", node, opts);
}
export function assertNoop(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Noop {
  assert("Noop", node, opts);
}
export function assertPlaceholder(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Placeholder {
  assert("Placeholder", node, opts);
}
export function assertV8IntrinsicIdentifier(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.V8IntrinsicIdentifier {
  assert("V8IntrinsicIdentifier", node, opts);
}
export function assertArgumentPlaceholder(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ArgumentPlaceholder {
  assert("ArgumentPlaceholder", node, opts);
}
export function assertBindExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.BindExpression {
  assert("BindExpression", node, opts);
}
export function assertImportAttribute(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ImportAttribute {
  assert("ImportAttribute", node, opts);
}
export function assertDecorator(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Decorator {
  assert("Decorator", node, opts);
}
export function assertDoExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DoExpression {
  assert("DoExpression", node, opts);
}
export function assertExportDefaultSpecifier(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ExportDefaultSpecifier {
  assert("ExportDefaultSpecifier", node, opts);
}
export function assertRecordExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.RecordExpression {
  assert("RecordExpression", node, opts);
}
export function assertTupleExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TupleExpression {
  assert("TupleExpression", node, opts);
}
export function assertDecimalLiteral(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.DecimalLiteral {
  assert("DecimalLiteral", node, opts);
}
export function assertStaticBlock(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.StaticBlock {
  assert("StaticBlock", node, opts);
}
export function assertModuleExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ModuleExpression {
  assert("ModuleExpression", node, opts);
}
export function assertTopicReference(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TopicReference {
  assert("TopicReference", node, opts);
}
export function assertPipelineTopicExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.PipelineTopicExpression {
  assert("PipelineTopicExpression", node, opts);
}
export function assertPipelineBareFunction(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.PipelineBareFunction {
  assert("PipelineBareFunction", node, opts);
}
export function assertPipelinePrimaryTopicReference(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.PipelinePrimaryTopicReference {
  assert("PipelinePrimaryTopicReference", node, opts);
}
export function assertTSParameterProperty(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSParameterProperty {
  assert("TSParameterProperty", node, opts);
}
export function assertTSDeclareFunction(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSDeclareFunction {
  assert("TSDeclareFunction", node, opts);
}
export function assertTSDeclareMethod(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSDeclareMethod {
  assert("TSDeclareMethod", node, opts);
}
export function assertTSQualifiedName(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSQualifiedName {
  assert("TSQualifiedName", node, opts);
}
export function assertTSCallSignatureDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSCallSignatureDeclaration {
  assert("TSCallSignatureDeclaration", node, opts);
}
export function assertTSConstructSignatureDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSConstructSignatureDeclaration {
  assert("TSConstructSignatureDeclaration", node, opts);
}
export function assertTSPropertySignature(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSPropertySignature {
  assert("TSPropertySignature", node, opts);
}
export function assertTSMethodSignature(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSMethodSignature {
  assert("TSMethodSignature", node, opts);
}
export function assertTSIndexSignature(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSIndexSignature {
  assert("TSIndexSignature", node, opts);
}
export function assertTSAnyKeyword(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSAnyKeyword {
  assert("TSAnyKeyword", node, opts);
}
export function assertTSBooleanKeyword(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSBooleanKeyword {
  assert("TSBooleanKeyword", node, opts);
}
export function assertTSBigIntKeyword(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSBigIntKeyword {
  assert("TSBigIntKeyword", node, opts);
}
export function assertTSIntrinsicKeyword(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSIntrinsicKeyword {
  assert("TSIntrinsicKeyword", node, opts);
}
export function assertTSNeverKeyword(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSNeverKeyword {
  assert("TSNeverKeyword", node, opts);
}
export function assertTSNullKeyword(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSNullKeyword {
  assert("TSNullKeyword", node, opts);
}
export function assertTSNumberKeyword(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSNumberKeyword {
  assert("TSNumberKeyword", node, opts);
}
export function assertTSObjectKeyword(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSObjectKeyword {
  assert("TSObjectKeyword", node, opts);
}
export function assertTSStringKeyword(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSStringKeyword {
  assert("TSStringKeyword", node, opts);
}
export function assertTSSymbolKeyword(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSSymbolKeyword {
  assert("TSSymbolKeyword", node, opts);
}
export function assertTSUndefinedKeyword(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSUndefinedKeyword {
  assert("TSUndefinedKeyword", node, opts);
}
export function assertTSUnknownKeyword(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSUnknownKeyword {
  assert("TSUnknownKeyword", node, opts);
}
export function assertTSVoidKeyword(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSVoidKeyword {
  assert("TSVoidKeyword", node, opts);
}
export function assertTSThisType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSThisType {
  assert("TSThisType", node, opts);
}
export function assertTSFunctionType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSFunctionType {
  assert("TSFunctionType", node, opts);
}
export function assertTSConstructorType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSConstructorType {
  assert("TSConstructorType", node, opts);
}
export function assertTSTypeReference(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSTypeReference {
  assert("TSTypeReference", node, opts);
}
export function assertTSTypePredicate(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSTypePredicate {
  assert("TSTypePredicate", node, opts);
}
export function assertTSTypeQuery(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSTypeQuery {
  assert("TSTypeQuery", node, opts);
}
export function assertTSTypeLiteral(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSTypeLiteral {
  assert("TSTypeLiteral", node, opts);
}
export function assertTSArrayType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSArrayType {
  assert("TSArrayType", node, opts);
}
export function assertTSTupleType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSTupleType {
  assert("TSTupleType", node, opts);
}
export function assertTSOptionalType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSOptionalType {
  assert("TSOptionalType", node, opts);
}
export function assertTSRestType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSRestType {
  assert("TSRestType", node, opts);
}
export function assertTSNamedTupleMember(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSNamedTupleMember {
  assert("TSNamedTupleMember", node, opts);
}
export function assertTSUnionType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSUnionType {
  assert("TSUnionType", node, opts);
}
export function assertTSIntersectionType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSIntersectionType {
  assert("TSIntersectionType", node, opts);
}
export function assertTSConditionalType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSConditionalType {
  assert("TSConditionalType", node, opts);
}
export function assertTSInferType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSInferType {
  assert("TSInferType", node, opts);
}
export function assertTSParenthesizedType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSParenthesizedType {
  assert("TSParenthesizedType", node, opts);
}
export function assertTSTypeOperator(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSTypeOperator {
  assert("TSTypeOperator", node, opts);
}
export function assertTSIndexedAccessType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSIndexedAccessType {
  assert("TSIndexedAccessType", node, opts);
}
export function assertTSMappedType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSMappedType {
  assert("TSMappedType", node, opts);
}
export function assertTSLiteralType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSLiteralType {
  assert("TSLiteralType", node, opts);
}
export function assertTSExpressionWithTypeArguments(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSExpressionWithTypeArguments {
  assert("TSExpressionWithTypeArguments", node, opts);
}
export function assertTSInterfaceDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSInterfaceDeclaration {
  assert("TSInterfaceDeclaration", node, opts);
}
export function assertTSInterfaceBody(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSInterfaceBody {
  assert("TSInterfaceBody", node, opts);
}
export function assertTSTypeAliasDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSTypeAliasDeclaration {
  assert("TSTypeAliasDeclaration", node, opts);
}
export function assertTSAsExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSAsExpression {
  assert("TSAsExpression", node, opts);
}
export function assertTSTypeAssertion(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSTypeAssertion {
  assert("TSTypeAssertion", node, opts);
}
export function assertTSEnumDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSEnumDeclaration {
  assert("TSEnumDeclaration", node, opts);
}
export function assertTSEnumMember(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSEnumMember {
  assert("TSEnumMember", node, opts);
}
export function assertTSModuleDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSModuleDeclaration {
  assert("TSModuleDeclaration", node, opts);
}
export function assertTSModuleBlock(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSModuleBlock {
  assert("TSModuleBlock", node, opts);
}
export function assertTSImportType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSImportType {
  assert("TSImportType", node, opts);
}
export function assertTSImportEqualsDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSImportEqualsDeclaration {
  assert("TSImportEqualsDeclaration", node, opts);
}
export function assertTSExternalModuleReference(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSExternalModuleReference {
  assert("TSExternalModuleReference", node, opts);
}
export function assertTSNonNullExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSNonNullExpression {
  assert("TSNonNullExpression", node, opts);
}
export function assertTSExportAssignment(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSExportAssignment {
  assert("TSExportAssignment", node, opts);
}
export function assertTSNamespaceExportDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSNamespaceExportDeclaration {
  assert("TSNamespaceExportDeclaration", node, opts);
}
export function assertTSTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSTypeAnnotation {
  assert("TSTypeAnnotation", node, opts);
}
export function assertTSTypeParameterInstantiation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSTypeParameterInstantiation {
  assert("TSTypeParameterInstantiation", node, opts);
}
export function assertTSTypeParameterDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSTypeParameterDeclaration {
  assert("TSTypeParameterDeclaration", node, opts);
}
export function assertTSTypeParameter(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSTypeParameter {
  assert("TSTypeParameter", node, opts);
}
export function assertExpression(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Expression {
  assert("Expression", node, opts);
}
export function assertBinary(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Binary {
  assert("Binary", node, opts);
}
export function assertScopable(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Scopable {
  assert("Scopable", node, opts);
}
export function assertBlockParent(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.BlockParent {
  assert("BlockParent", node, opts);
}
export function assertBlock(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Block {
  assert("Block", node, opts);
}
export function assertStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Statement {
  assert("Statement", node, opts);
}
export function assertTerminatorless(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Terminatorless {
  assert("Terminatorless", node, opts);
}
export function assertCompletionStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.CompletionStatement {
  assert("CompletionStatement", node, opts);
}
export function assertConditional(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Conditional {
  assert("Conditional", node, opts);
}
export function assertLoop(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Loop {
  assert("Loop", node, opts);
}
export function assertWhile(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.While {
  assert("While", node, opts);
}
export function assertExpressionWrapper(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ExpressionWrapper {
  assert("ExpressionWrapper", node, opts);
}
export function assertFor(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.For {
  assert("For", node, opts);
}
export function assertForXStatement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ForXStatement {
  assert("ForXStatement", node, opts);
}
export function assertFunction(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Function {
  assert("Function", node, opts);
}
export function assertFunctionParent(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.FunctionParent {
  assert("FunctionParent", node, opts);
}
export function assertPureish(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Pureish {
  assert("Pureish", node, opts);
}
export function assertDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Declaration {
  assert("Declaration", node, opts);
}
export function assertPatternLike(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.PatternLike {
  assert("PatternLike", node, opts);
}
export function assertLVal(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.LVal {
  assert("LVal", node, opts);
}
export function assertTSEntityName(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSEntityName {
  assert("TSEntityName", node, opts);
}
export function assertLiteral(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Literal {
  assert("Literal", node, opts);
}
export function assertImmutable(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Immutable {
  assert("Immutable", node, opts);
}
export function assertUserWhitespacable(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.UserWhitespacable {
  assert("UserWhitespacable", node, opts);
}
export function assertMethod(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Method {
  assert("Method", node, opts);
}
export function assertObjectMember(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ObjectMember {
  assert("ObjectMember", node, opts);
}
export function assertProperty(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Property {
  assert("Property", node, opts);
}
export function assertUnaryLike(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.UnaryLike {
  assert("UnaryLike", node, opts);
}
export function assertPattern(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Pattern {
  assert("Pattern", node, opts);
}
export function assertClass(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Class {
  assert("Class", node, opts);
}
export function assertModuleDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ModuleDeclaration {
  assert("ModuleDeclaration", node, opts);
}
export function assertExportDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ExportDeclaration {
  assert("ExportDeclaration", node, opts);
}
export function assertModuleSpecifier(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.ModuleSpecifier {
  assert("ModuleSpecifier", node, opts);
}
export function assertPrivate(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Private {
  assert("Private", node, opts);
}
export function assertFlow(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.Flow {
  assert("Flow", node, opts);
}
export function assertFlowType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.FlowType {
  assert("FlowType", node, opts);
}
export function assertFlowBaseAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.FlowBaseAnnotation {
  assert("FlowBaseAnnotation", node, opts);
}
export function assertFlowDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.FlowDeclaration {
  assert("FlowDeclaration", node, opts);
}
export function assertFlowPredicate(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.FlowPredicate {
  assert("FlowPredicate", node, opts);
}
export function assertEnumBody(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.EnumBody {
  assert("EnumBody", node, opts);
}
export function assertEnumMember(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.EnumMember {
  assert("EnumMember", node, opts);
}
export function assertJSX(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.JSX {
  assert("JSX", node, opts);
}
export function assertTSTypeElement(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSTypeElement {
  assert("TSTypeElement", node, opts);
}
export function assertTSType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSType {
  assert("TSType", node, opts);
}
export function assertTSBaseType(
  node: object | null | undefined,
  opts?: object | null,
): asserts node is t.TSBaseType {
  assert("TSBaseType", node, opts);
}
export function assertNumberLiteral(node: any, opts: any): void {
  console.trace(
    "The node type NumberLiteral has been renamed to NumericLiteral",
  );
  assert("NumberLiteral", node, opts);
}
export function assertRegexLiteral(node: any, opts: any): void {
  console.trace("The node type RegexLiteral has been renamed to RegExpLiteral");
  assert("RegexLiteral", node, opts);
}
export function assertRestProperty(node: any, opts: any): void {
  console.trace("The node type RestProperty has been renamed to RestElement");
  assert("RestProperty", node, opts);
}
export function assertSpreadProperty(node: any, opts: any): void {
  console.trace(
    "The node type SpreadProperty has been renamed to SpreadElement",
  );
  assert("SpreadProperty", node, opts);
}
