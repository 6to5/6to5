/*
 * This file is auto-generated! Do not modify it directly.
 * To re-generate run 'make build'
 */
import builder from "../builder";
import type * as t from "../..";

/* eslint-disable @typescript-eslint/no-unused-vars */

export function arrayExpression(
  elements?: Array<null | t.Expression | t.SpreadElement>,
): t.ArrayExpression {
  return builder("ArrayExpression", ...arguments);
}
export function assignmentExpression(
  operator: string,
  left: t.LVal,
  right: t.Expression,
): t.AssignmentExpression {
  return builder("AssignmentExpression", ...arguments);
}
export function binaryExpression(
  operator:
    | "+"
    | "-"
    | "/"
    | "%"
    | "*"
    | "**"
    | "&"
    | "|"
    | ">>"
    | ">>>"
    | "<<"
    | "^"
    | "=="
    | "==="
    | "!="
    | "!=="
    | "in"
    | "instanceof"
    | ">"
    | "<"
    | ">="
    | "<=",
  left: t.Expression | t.PrivateName,
  right: t.Expression,
): t.BinaryExpression {
  return builder("BinaryExpression", ...arguments);
}
export function interpreterDirective(value: string): t.InterpreterDirective {
  return builder("InterpreterDirective", ...arguments);
}
export function directive(value: t.DirectiveLiteral): t.Directive {
  return builder("Directive", ...arguments);
}
export function directiveLiteral(value: string): t.DirectiveLiteral {
  return builder("DirectiveLiteral", ...arguments);
}
export function blockStatement(
  body: Array<t.Statement>,
  directives?: Array<t.Directive>,
): t.BlockStatement {
  return builder("BlockStatement", ...arguments);
}
export function breakStatement(label?: t.Identifier | null): t.BreakStatement {
  return builder("BreakStatement", ...arguments);
}
export function callExpression(
  callee: t.Expression | t.V8IntrinsicIdentifier,
  _arguments: Array<
    t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ArgumentPlaceholder
  >,
): t.CallExpression {
  return builder("CallExpression", ...arguments);
}
export function catchClause(
  param: t.Identifier | t.ArrayPattern | t.ObjectPattern | null | undefined,
  body: t.BlockStatement,
): t.CatchClause {
  return builder("CatchClause", ...arguments);
}
export function conditionalExpression(
  test: t.Expression,
  consequent: t.Expression,
  alternate: t.Expression,
): t.ConditionalExpression {
  return builder("ConditionalExpression", ...arguments);
}
export function continueStatement(
  label?: t.Identifier | null,
): t.ContinueStatement {
  return builder("ContinueStatement", ...arguments);
}
export function debuggerStatement(): t.DebuggerStatement {
  return builder("DebuggerStatement", ...arguments);
}
export function doWhileStatement(
  test: t.Expression,
  body: t.Statement,
): t.DoWhileStatement {
  return builder("DoWhileStatement", ...arguments);
}
export function emptyStatement(): t.EmptyStatement {
  return builder("EmptyStatement", ...arguments);
}
export function expressionStatement(
  expression: t.Expression,
): t.ExpressionStatement {
  return builder("ExpressionStatement", ...arguments);
}
export function file(
  program: t.Program,
  comments?: Array<t.CommentBlock | t.CommentLine> | null,
  tokens?: Array<any> | null,
): t.File {
  return builder("File", ...arguments);
}
export function forInStatement(
  left: t.VariableDeclaration | t.LVal,
  right: t.Expression,
  body: t.Statement,
): t.ForInStatement {
  return builder("ForInStatement", ...arguments);
}
export function forStatement(
  init: t.VariableDeclaration | t.Expression | null | undefined,
  test: t.Expression | null | undefined,
  update: t.Expression | null | undefined,
  body: t.Statement,
): t.ForStatement {
  return builder("ForStatement", ...arguments);
}
export function functionDeclaration(
  id: t.Identifier | null | undefined,
  params: Array<t.Identifier | t.Pattern | t.RestElement>,
  body: t.BlockStatement,
  generator?: boolean,
  async?: boolean,
): t.FunctionDeclaration {
  return builder("FunctionDeclaration", ...arguments);
}
export function functionExpression(
  id: t.Identifier | null | undefined,
  params: Array<t.Identifier | t.Pattern | t.RestElement>,
  body: t.BlockStatement,
  generator?: boolean,
  async?: boolean,
): t.FunctionExpression {
  return builder("FunctionExpression", ...arguments);
}
export function identifier(name: string): t.Identifier {
  return builder("Identifier", ...arguments);
}
export function ifStatement(
  test: t.Expression,
  consequent: t.Statement,
  alternate?: t.Statement | null,
): t.IfStatement {
  return builder("IfStatement", ...arguments);
}
export function labeledStatement(
  label: t.Identifier,
  body: t.Statement,
): t.LabeledStatement {
  return builder("LabeledStatement", ...arguments);
}
export function stringLiteral(value: string): t.StringLiteral {
  return builder("StringLiteral", ...arguments);
}
export function numericLiteral(value: number): t.NumericLiteral {
  return builder("NumericLiteral", ...arguments);
}
export function nullLiteral(): t.NullLiteral {
  return builder("NullLiteral", ...arguments);
}
export function booleanLiteral(value: boolean): t.BooleanLiteral {
  return builder("BooleanLiteral", ...arguments);
}
export function regExpLiteral(
  pattern: string,
  flags?: string,
): t.RegExpLiteral {
  return builder("RegExpLiteral", ...arguments);
}
export function logicalExpression(
  operator: "||" | "&&" | "??",
  left: t.Expression,
  right: t.Expression,
): t.LogicalExpression {
  return builder("LogicalExpression", ...arguments);
}
export function memberExpression(
  object: t.Expression,
  property: t.Expression | t.Identifier | t.PrivateName,
  computed?: boolean,
  optional?: true | false | null,
): t.MemberExpression {
  return builder("MemberExpression", ...arguments);
}
export function newExpression(
  callee: t.Expression | t.V8IntrinsicIdentifier,
  _arguments: Array<
    t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ArgumentPlaceholder
  >,
): t.NewExpression {
  return builder("NewExpression", ...arguments);
}
export function program(
  body: Array<t.Statement>,
  directives?: Array<t.Directive>,
  sourceType?: "script" | "module",
  interpreter?: t.InterpreterDirective | null,
): t.Program {
  return builder("Program", ...arguments);
}
export function objectExpression(
  properties: Array<t.ObjectMethod | t.ObjectProperty | t.SpreadElement>,
): t.ObjectExpression {
  return builder("ObjectExpression", ...arguments);
}
export function objectMethod(
  kind: "method" | "get" | "set" | undefined,
  key: t.Expression | t.Identifier | t.StringLiteral | t.NumericLiteral,
  params: Array<t.Identifier | t.Pattern | t.RestElement>,
  body: t.BlockStatement,
  computed?: boolean,
  generator?: boolean,
  async?: boolean,
): t.ObjectMethod {
  return builder("ObjectMethod", ...arguments);
}
export function objectProperty(
  key: t.Expression | t.Identifier | t.StringLiteral | t.NumericLiteral,
  value: t.Expression | t.PatternLike,
  computed?: boolean,
  shorthand?: boolean,
  decorators?: Array<t.Decorator> | null,
): t.ObjectProperty {
  return builder("ObjectProperty", ...arguments);
}
export function restElement(argument: t.LVal): t.RestElement {
  return builder("RestElement", ...arguments);
}
export function returnStatement(
  argument?: t.Expression | null,
): t.ReturnStatement {
  return builder("ReturnStatement", ...arguments);
}
export function sequenceExpression(
  expressions: Array<t.Expression>,
): t.SequenceExpression {
  return builder("SequenceExpression", ...arguments);
}
export function parenthesizedExpression(
  expression: t.Expression,
): t.ParenthesizedExpression {
  return builder("ParenthesizedExpression", ...arguments);
}
export function switchCase(
  test: t.Expression | null | undefined,
  consequent: Array<t.Statement>,
): t.SwitchCase {
  return builder("SwitchCase", ...arguments);
}
export function switchStatement(
  discriminant: t.Expression,
  cases: Array<t.SwitchCase>,
): t.SwitchStatement {
  return builder("SwitchStatement", ...arguments);
}
export function thisExpression(): t.ThisExpression {
  return builder("ThisExpression", ...arguments);
}
export function throwStatement(argument: t.Expression): t.ThrowStatement {
  return builder("ThrowStatement", ...arguments);
}
export function tryStatement(
  block: t.BlockStatement,
  handler?: t.CatchClause | null,
  finalizer?: t.BlockStatement | null,
): t.TryStatement {
  return builder("TryStatement", ...arguments);
}
export function unaryExpression(
  operator: "void" | "throw" | "delete" | "!" | "+" | "-" | "~" | "typeof",
  argument: t.Expression,
  prefix?: boolean,
): t.UnaryExpression {
  return builder("UnaryExpression", ...arguments);
}
export function updateExpression(
  operator: "++" | "--",
  argument: t.Expression,
  prefix?: boolean,
): t.UpdateExpression {
  return builder("UpdateExpression", ...arguments);
}
export function variableDeclaration(
  kind: "var" | "let" | "const",
  declarations: Array<t.VariableDeclarator>,
): t.VariableDeclaration {
  return builder("VariableDeclaration", ...arguments);
}
export function variableDeclarator(
  id: t.LVal,
  init?: t.Expression | null,
): t.VariableDeclarator {
  return builder("VariableDeclarator", ...arguments);
}
export function whileStatement(
  test: t.Expression,
  body: t.Statement,
): t.WhileStatement {
  return builder("WhileStatement", ...arguments);
}
export function withStatement(
  object: t.Expression,
  body: t.Statement,
): t.WithStatement {
  return builder("WithStatement", ...arguments);
}
export function assignmentPattern(
  left: t.Identifier | t.ObjectPattern | t.ArrayPattern | t.MemberExpression,
  right: t.Expression,
): t.AssignmentPattern {
  return builder("AssignmentPattern", ...arguments);
}
export function arrayPattern(
  elements: Array<null | t.PatternLike>,
): t.ArrayPattern {
  return builder("ArrayPattern", ...arguments);
}
export function arrowFunctionExpression(
  params: Array<t.Identifier | t.Pattern | t.RestElement>,
  body: t.BlockStatement | t.Expression,
  async?: boolean,
): t.ArrowFunctionExpression {
  return builder("ArrowFunctionExpression", ...arguments);
}
export function classBody(
  body: Array<
    | t.ClassMethod
    | t.ClassPrivateMethod
    | t.ClassProperty
    | t.ClassPrivateProperty
    | t.TSDeclareMethod
    | t.TSIndexSignature
  >,
): t.ClassBody {
  return builder("ClassBody", ...arguments);
}
export function classExpression(
  id: t.Identifier | null | undefined,
  superClass: t.Expression | null | undefined,
  body: t.ClassBody,
  decorators?: Array<t.Decorator> | null,
): t.ClassExpression {
  return builder("ClassExpression", ...arguments);
}
export function classDeclaration(
  id: t.Identifier,
  superClass: t.Expression | null | undefined,
  body: t.ClassBody,
  decorators?: Array<t.Decorator> | null,
): t.ClassDeclaration {
  return builder("ClassDeclaration", ...arguments);
}
export function exportAllDeclaration(
  source: t.StringLiteral,
): t.ExportAllDeclaration {
  return builder("ExportAllDeclaration", ...arguments);
}
export function exportDefaultDeclaration(
  declaration:
    | t.FunctionDeclaration
    | t.TSDeclareFunction
    | t.ClassDeclaration
    | t.Expression,
): t.ExportDefaultDeclaration {
  return builder("ExportDefaultDeclaration", ...arguments);
}
export function exportNamedDeclaration(
  declaration?: t.Declaration | null,
  specifiers?: Array<
    t.ExportSpecifier | t.ExportDefaultSpecifier | t.ExportNamespaceSpecifier
  >,
  source?: t.StringLiteral | null,
): t.ExportNamedDeclaration {
  return builder("ExportNamedDeclaration", ...arguments);
}
export function exportSpecifier(
  local: t.Identifier,
  exported: t.Identifier | t.StringLiteral,
): t.ExportSpecifier {
  return builder("ExportSpecifier", ...arguments);
}
export function forOfStatement(
  left: t.VariableDeclaration | t.LVal,
  right: t.Expression,
  body: t.Statement,
  _await?: boolean,
): t.ForOfStatement {
  return builder("ForOfStatement", ...arguments);
}
export function importDeclaration(
  specifiers: Array<
    t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier
  >,
  source: t.StringLiteral,
): t.ImportDeclaration {
  return builder("ImportDeclaration", ...arguments);
}
export function importDefaultSpecifier(
  local: t.Identifier,
): t.ImportDefaultSpecifier {
  return builder("ImportDefaultSpecifier", ...arguments);
}
export function importNamespaceSpecifier(
  local: t.Identifier,
): t.ImportNamespaceSpecifier {
  return builder("ImportNamespaceSpecifier", ...arguments);
}
export function importSpecifier(
  local: t.Identifier,
  imported: t.Identifier | t.StringLiteral,
): t.ImportSpecifier {
  return builder("ImportSpecifier", ...arguments);
}
export function metaProperty(
  meta: t.Identifier,
  property: t.Identifier,
): t.MetaProperty {
  return builder("MetaProperty", ...arguments);
}
export function classMethod(
  kind: "get" | "set" | "method" | "constructor" | undefined,
  key: t.Identifier | t.StringLiteral | t.NumericLiteral | t.Expression,
  params: Array<
    t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty
  >,
  body: t.BlockStatement,
  computed?: boolean,
  _static?: boolean,
  generator?: boolean,
  async?: boolean,
): t.ClassMethod {
  return builder("ClassMethod", ...arguments);
}
export function objectPattern(
  properties: Array<t.RestElement | t.ObjectProperty>,
): t.ObjectPattern {
  return builder("ObjectPattern", ...arguments);
}
export function spreadElement(argument: t.Expression): t.SpreadElement {
  return builder("SpreadElement", ...arguments);
}
function _super(): t.Super {
  return builder("Super", ...arguments);
}
export { _super as super };
export function taggedTemplateExpression(
  tag: t.Expression,
  quasi: t.TemplateLiteral,
): t.TaggedTemplateExpression {
  return builder("TaggedTemplateExpression", ...arguments);
}
export function templateElement(
  value: { raw: string; cooked?: string },
  tail?: boolean,
): t.TemplateElement {
  return builder("TemplateElement", ...arguments);
}
export function templateLiteral(
  quasis: Array<t.TemplateElement>,
  expressions: Array<t.Expression | t.TSType>,
): t.TemplateLiteral {
  return builder("TemplateLiteral", ...arguments);
}
export function yieldExpression(
  argument?: t.Expression | null,
  delegate?: boolean,
): t.YieldExpression {
  return builder("YieldExpression", ...arguments);
}
export function awaitExpression(argument: t.Expression): t.AwaitExpression {
  return builder("AwaitExpression", ...arguments);
}
function _import(): t.Import {
  return builder("Import", ...arguments);
}
export { _import as import };
export function bigIntLiteral(value: string): t.BigIntLiteral {
  return builder("BigIntLiteral", ...arguments);
}
export function exportNamespaceSpecifier(
  exported: t.Identifier,
): t.ExportNamespaceSpecifier {
  return builder("ExportNamespaceSpecifier", ...arguments);
}
export function optionalMemberExpression(
  object: t.Expression,
  property: t.Expression | t.Identifier,
  computed: boolean | undefined,
  optional: boolean,
): t.OptionalMemberExpression {
  return builder("OptionalMemberExpression", ...arguments);
}
export function optionalCallExpression(
  callee: t.Expression,
  _arguments: Array<
    t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ArgumentPlaceholder
  >,
  optional: boolean,
): t.OptionalCallExpression {
  return builder("OptionalCallExpression", ...arguments);
}
export function classProperty(
  key: t.Identifier | t.StringLiteral | t.NumericLiteral | t.Expression,
  value?: t.Expression | null,
  typeAnnotation?: t.TypeAnnotation | t.TSTypeAnnotation | t.Noop | null,
  decorators?: Array<t.Decorator> | null,
  computed?: boolean,
  _static?: boolean,
): t.ClassProperty {
  return builder("ClassProperty", ...arguments);
}
export function classPrivateProperty(
  key: t.PrivateName,
  value: t.Expression | null | undefined,
  decorators: Array<t.Decorator> | null | undefined,
  _static: any,
): t.ClassPrivateProperty {
  return builder("ClassPrivateProperty", ...arguments);
}
export function classPrivateMethod(
  kind: "get" | "set" | "method" | "constructor" | undefined,
  key: t.PrivateName,
  params: Array<
    t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty
  >,
  body: t.BlockStatement,
  _static?: boolean,
): t.ClassPrivateMethod {
  return builder("ClassPrivateMethod", ...arguments);
}
export function privateName(id: t.Identifier): t.PrivateName {
  return builder("PrivateName", ...arguments);
}
export function anyTypeAnnotation(): t.AnyTypeAnnotation {
  return builder("AnyTypeAnnotation", ...arguments);
}
export function arrayTypeAnnotation(
  elementType: t.FlowType,
): t.ArrayTypeAnnotation {
  return builder("ArrayTypeAnnotation", ...arguments);
}
export function booleanTypeAnnotation(): t.BooleanTypeAnnotation {
  return builder("BooleanTypeAnnotation", ...arguments);
}
export function booleanLiteralTypeAnnotation(
  value: boolean,
): t.BooleanLiteralTypeAnnotation {
  return builder("BooleanLiteralTypeAnnotation", ...arguments);
}
export function nullLiteralTypeAnnotation(): t.NullLiteralTypeAnnotation {
  return builder("NullLiteralTypeAnnotation", ...arguments);
}
export function classImplements(
  id: t.Identifier,
  typeParameters?: t.TypeParameterInstantiation | null,
): t.ClassImplements {
  return builder("ClassImplements", ...arguments);
}
export function declareClass(
  id: t.Identifier,
  typeParameters: t.TypeParameterDeclaration | null | undefined,
  _extends: Array<t.InterfaceExtends> | null | undefined,
  body: t.ObjectTypeAnnotation,
): t.DeclareClass {
  return builder("DeclareClass", ...arguments);
}
export function declareFunction(id: t.Identifier): t.DeclareFunction {
  return builder("DeclareFunction", ...arguments);
}
export function declareInterface(
  id: t.Identifier,
  typeParameters: t.TypeParameterDeclaration | null | undefined,
  _extends: Array<t.InterfaceExtends> | null | undefined,
  body: t.ObjectTypeAnnotation,
): t.DeclareInterface {
  return builder("DeclareInterface", ...arguments);
}
export function declareModule(
  id: t.Identifier | t.StringLiteral,
  body: t.BlockStatement,
  kind?: "CommonJS" | "ES" | null,
): t.DeclareModule {
  return builder("DeclareModule", ...arguments);
}
export function declareModuleExports(
  typeAnnotation: t.TypeAnnotation,
): t.DeclareModuleExports {
  return builder("DeclareModuleExports", ...arguments);
}
export function declareTypeAlias(
  id: t.Identifier,
  typeParameters: t.TypeParameterDeclaration | null | undefined,
  right: t.FlowType,
): t.DeclareTypeAlias {
  return builder("DeclareTypeAlias", ...arguments);
}
export function declareOpaqueType(
  id: t.Identifier,
  typeParameters?: t.TypeParameterDeclaration | null,
  supertype?: t.FlowType | null,
): t.DeclareOpaqueType {
  return builder("DeclareOpaqueType", ...arguments);
}
export function declareVariable(id: t.Identifier): t.DeclareVariable {
  return builder("DeclareVariable", ...arguments);
}
export function declareExportDeclaration(
  declaration?: t.Flow | null,
  specifiers?: Array<t.ExportSpecifier | t.ExportNamespaceSpecifier> | null,
  source?: t.StringLiteral | null,
): t.DeclareExportDeclaration {
  return builder("DeclareExportDeclaration", ...arguments);
}
export function declareExportAllDeclaration(
  source: t.StringLiteral,
): t.DeclareExportAllDeclaration {
  return builder("DeclareExportAllDeclaration", ...arguments);
}
export function declaredPredicate(value: t.Flow): t.DeclaredPredicate {
  return builder("DeclaredPredicate", ...arguments);
}
export function existsTypeAnnotation(): t.ExistsTypeAnnotation {
  return builder("ExistsTypeAnnotation", ...arguments);
}
export function functionTypeAnnotation(
  typeParameters: t.TypeParameterDeclaration | null | undefined,
  params: Array<t.FunctionTypeParam>,
  rest: t.FunctionTypeParam | null | undefined,
  returnType: t.FlowType,
): t.FunctionTypeAnnotation {
  return builder("FunctionTypeAnnotation", ...arguments);
}
export function functionTypeParam(
  name: t.Identifier | null | undefined,
  typeAnnotation: t.FlowType,
): t.FunctionTypeParam {
  return builder("FunctionTypeParam", ...arguments);
}
export function genericTypeAnnotation(
  id: t.Identifier | t.QualifiedTypeIdentifier,
  typeParameters?: t.TypeParameterInstantiation | null,
): t.GenericTypeAnnotation {
  return builder("GenericTypeAnnotation", ...arguments);
}
export function inferredPredicate(): t.InferredPredicate {
  return builder("InferredPredicate", ...arguments);
}
export function interfaceExtends(
  id: t.Identifier | t.QualifiedTypeIdentifier,
  typeParameters?: t.TypeParameterInstantiation | null,
): t.InterfaceExtends {
  return builder("InterfaceExtends", ...arguments);
}
export function interfaceDeclaration(
  id: t.Identifier,
  typeParameters: t.TypeParameterDeclaration | null | undefined,
  _extends: Array<t.InterfaceExtends> | null | undefined,
  body: t.ObjectTypeAnnotation,
): t.InterfaceDeclaration {
  return builder("InterfaceDeclaration", ...arguments);
}
export function interfaceTypeAnnotation(
  _extends: Array<t.InterfaceExtends> | null | undefined,
  body: t.ObjectTypeAnnotation,
): t.InterfaceTypeAnnotation {
  return builder("InterfaceTypeAnnotation", ...arguments);
}
export function intersectionTypeAnnotation(
  types: Array<t.FlowType>,
): t.IntersectionTypeAnnotation {
  return builder("IntersectionTypeAnnotation", ...arguments);
}
export function mixedTypeAnnotation(): t.MixedTypeAnnotation {
  return builder("MixedTypeAnnotation", ...arguments);
}
export function emptyTypeAnnotation(): t.EmptyTypeAnnotation {
  return builder("EmptyTypeAnnotation", ...arguments);
}
export function nullableTypeAnnotation(
  typeAnnotation: t.FlowType,
): t.NullableTypeAnnotation {
  return builder("NullableTypeAnnotation", ...arguments);
}
export function numberLiteralTypeAnnotation(
  value: number,
): t.NumberLiteralTypeAnnotation {
  return builder("NumberLiteralTypeAnnotation", ...arguments);
}
export function numberTypeAnnotation(): t.NumberTypeAnnotation {
  return builder("NumberTypeAnnotation", ...arguments);
}
export function objectTypeAnnotation(
  properties: Array<t.ObjectTypeProperty | t.ObjectTypeSpreadProperty>,
  indexers?: Array<t.ObjectTypeIndexer> | null,
  callProperties?: Array<t.ObjectTypeCallProperty> | null,
  internalSlots?: Array<t.ObjectTypeInternalSlot> | null,
  exact?: boolean,
): t.ObjectTypeAnnotation {
  return builder("ObjectTypeAnnotation", ...arguments);
}
export function objectTypeInternalSlot(
  id: t.Identifier,
  value: t.FlowType,
  optional: boolean,
  _static: boolean,
  method: boolean,
): t.ObjectTypeInternalSlot {
  return builder("ObjectTypeInternalSlot", ...arguments);
}
export function objectTypeCallProperty(
  value: t.FlowType,
): t.ObjectTypeCallProperty {
  return builder("ObjectTypeCallProperty", ...arguments);
}
export function objectTypeIndexer(
  id: t.Identifier | null | undefined,
  key: t.FlowType,
  value: t.FlowType,
  variance?: t.Variance | null,
): t.ObjectTypeIndexer {
  return builder("ObjectTypeIndexer", ...arguments);
}
export function objectTypeProperty(
  key: t.Identifier | t.StringLiteral,
  value: t.FlowType,
  variance?: t.Variance | null,
): t.ObjectTypeProperty {
  return builder("ObjectTypeProperty", ...arguments);
}
export function objectTypeSpreadProperty(
  argument: t.FlowType,
): t.ObjectTypeSpreadProperty {
  return builder("ObjectTypeSpreadProperty", ...arguments);
}
export function opaqueType(
  id: t.Identifier,
  typeParameters: t.TypeParameterDeclaration | null | undefined,
  supertype: t.FlowType | null | undefined,
  impltype: t.FlowType,
): t.OpaqueType {
  return builder("OpaqueType", ...arguments);
}
export function qualifiedTypeIdentifier(
  id: t.Identifier,
  qualification: t.Identifier | t.QualifiedTypeIdentifier,
): t.QualifiedTypeIdentifier {
  return builder("QualifiedTypeIdentifier", ...arguments);
}
export function stringLiteralTypeAnnotation(
  value: string,
): t.StringLiteralTypeAnnotation {
  return builder("StringLiteralTypeAnnotation", ...arguments);
}
export function stringTypeAnnotation(): t.StringTypeAnnotation {
  return builder("StringTypeAnnotation", ...arguments);
}
export function symbolTypeAnnotation(): t.SymbolTypeAnnotation {
  return builder("SymbolTypeAnnotation", ...arguments);
}
export function thisTypeAnnotation(): t.ThisTypeAnnotation {
  return builder("ThisTypeAnnotation", ...arguments);
}
export function tupleTypeAnnotation(
  types: Array<t.FlowType>,
): t.TupleTypeAnnotation {
  return builder("TupleTypeAnnotation", ...arguments);
}
export function typeofTypeAnnotation(
  argument: t.FlowType,
): t.TypeofTypeAnnotation {
  return builder("TypeofTypeAnnotation", ...arguments);
}
export function typeAlias(
  id: t.Identifier,
  typeParameters: t.TypeParameterDeclaration | null | undefined,
  right: t.FlowType,
): t.TypeAlias {
  return builder("TypeAlias", ...arguments);
}
export function typeAnnotation(typeAnnotation: t.FlowType): t.TypeAnnotation {
  return builder("TypeAnnotation", ...arguments);
}
export function typeCastExpression(
  expression: t.Expression,
  typeAnnotation: t.TypeAnnotation,
): t.TypeCastExpression {
  return builder("TypeCastExpression", ...arguments);
}
export function typeParameter(
  bound?: t.TypeAnnotation | null,
  _default?: t.FlowType | null,
  variance?: t.Variance | null,
): t.TypeParameter {
  return builder("TypeParameter", ...arguments);
}
export function typeParameterDeclaration(
  params: Array<t.TypeParameter>,
): t.TypeParameterDeclaration {
  return builder("TypeParameterDeclaration", ...arguments);
}
export function typeParameterInstantiation(
  params: Array<t.FlowType>,
): t.TypeParameterInstantiation {
  return builder("TypeParameterInstantiation", ...arguments);
}
export function unionTypeAnnotation(
  types: Array<t.FlowType>,
): t.UnionTypeAnnotation {
  return builder("UnionTypeAnnotation", ...arguments);
}
export function variance(kind: "minus" | "plus"): t.Variance {
  return builder("Variance", ...arguments);
}
export function voidTypeAnnotation(): t.VoidTypeAnnotation {
  return builder("VoidTypeAnnotation", ...arguments);
}
export function enumDeclaration(
  id: t.Identifier,
  body:
    | t.EnumBooleanBody
    | t.EnumNumberBody
    | t.EnumStringBody
    | t.EnumSymbolBody,
): t.EnumDeclaration {
  return builder("EnumDeclaration", ...arguments);
}
export function enumBooleanBody(
  members: Array<t.EnumBooleanMember>,
): t.EnumBooleanBody {
  return builder("EnumBooleanBody", ...arguments);
}
export function enumNumberBody(
  members: Array<t.EnumNumberMember>,
): t.EnumNumberBody {
  return builder("EnumNumberBody", ...arguments);
}
export function enumStringBody(
  members: Array<t.EnumStringMember | t.EnumDefaultedMember>,
): t.EnumStringBody {
  return builder("EnumStringBody", ...arguments);
}
export function enumSymbolBody(
  members: Array<t.EnumDefaultedMember>,
): t.EnumSymbolBody {
  return builder("EnumSymbolBody", ...arguments);
}
export function enumBooleanMember(id: t.Identifier): t.EnumBooleanMember {
  return builder("EnumBooleanMember", ...arguments);
}
export function enumNumberMember(
  id: t.Identifier,
  init: t.NumericLiteral,
): t.EnumNumberMember {
  return builder("EnumNumberMember", ...arguments);
}
export function enumStringMember(
  id: t.Identifier,
  init: t.StringLiteral,
): t.EnumStringMember {
  return builder("EnumStringMember", ...arguments);
}
export function enumDefaultedMember(id: t.Identifier): t.EnumDefaultedMember {
  return builder("EnumDefaultedMember", ...arguments);
}
export function indexedAccessType(
  objectType: t.FlowType,
  indexType: t.FlowType,
): t.IndexedAccessType {
  return builder("IndexedAccessType", ...arguments);
}
export function optionalIndexedAccessType(
  objectType: t.FlowType,
  indexType: t.FlowType,
): t.OptionalIndexedAccessType {
  return builder("OptionalIndexedAccessType", ...arguments);
}
export function jsxAttribute(
  name: t.JSXIdentifier | t.JSXNamespacedName,
  value?:
    | t.JSXElement
    | t.JSXFragment
    | t.StringLiteral
    | t.JSXExpressionContainer
    | null,
): t.JSXAttribute {
  return builder("JSXAttribute", ...arguments);
}
export { jsxAttribute as jSXAttribute };
export function jsxClosingElement(
  name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName,
): t.JSXClosingElement {
  return builder("JSXClosingElement", ...arguments);
}
export { jsxClosingElement as jSXClosingElement };
export function jsxElement(
  openingElement: t.JSXOpeningElement,
  closingElement: t.JSXClosingElement | null | undefined,
  children: Array<
    | t.JSXText
    | t.JSXExpressionContainer
    | t.JSXSpreadChild
    | t.JSXElement
    | t.JSXFragment
  >,
  selfClosing?: boolean | null,
): t.JSXElement {
  return builder("JSXElement", ...arguments);
}
export { jsxElement as jSXElement };
export function jsxEmptyExpression(): t.JSXEmptyExpression {
  return builder("JSXEmptyExpression", ...arguments);
}
export { jsxEmptyExpression as jSXEmptyExpression };
export function jsxExpressionContainer(
  expression: t.Expression | t.JSXEmptyExpression,
): t.JSXExpressionContainer {
  return builder("JSXExpressionContainer", ...arguments);
}
export { jsxExpressionContainer as jSXExpressionContainer };
export function jsxSpreadChild(expression: t.Expression): t.JSXSpreadChild {
  return builder("JSXSpreadChild", ...arguments);
}
export { jsxSpreadChild as jSXSpreadChild };
export function jsxIdentifier(name: string): t.JSXIdentifier {
  return builder("JSXIdentifier", ...arguments);
}
export { jsxIdentifier as jSXIdentifier };
export function jsxMemberExpression(
  object: t.JSXMemberExpression | t.JSXIdentifier,
  property: t.JSXIdentifier,
): t.JSXMemberExpression {
  return builder("JSXMemberExpression", ...arguments);
}
export { jsxMemberExpression as jSXMemberExpression };
export function jsxNamespacedName(
  namespace: t.JSXIdentifier,
  name: t.JSXIdentifier,
): t.JSXNamespacedName {
  return builder("JSXNamespacedName", ...arguments);
}
export { jsxNamespacedName as jSXNamespacedName };
export function jsxOpeningElement(
  name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName,
  attributes: Array<t.JSXAttribute | t.JSXSpreadAttribute>,
  selfClosing?: boolean,
): t.JSXOpeningElement {
  return builder("JSXOpeningElement", ...arguments);
}
export { jsxOpeningElement as jSXOpeningElement };
export function jsxSpreadAttribute(
  argument: t.Expression,
): t.JSXSpreadAttribute {
  return builder("JSXSpreadAttribute", ...arguments);
}
export { jsxSpreadAttribute as jSXSpreadAttribute };
export function jsxText(value: string): t.JSXText {
  return builder("JSXText", ...arguments);
}
export { jsxText as jSXText };
export function jsxFragment(
  openingFragment: t.JSXOpeningFragment,
  closingFragment: t.JSXClosingFragment,
  children: Array<
    | t.JSXText
    | t.JSXExpressionContainer
    | t.JSXSpreadChild
    | t.JSXElement
    | t.JSXFragment
  >,
): t.JSXFragment {
  return builder("JSXFragment", ...arguments);
}
export { jsxFragment as jSXFragment };
export function jsxOpeningFragment(): t.JSXOpeningFragment {
  return builder("JSXOpeningFragment", ...arguments);
}
export { jsxOpeningFragment as jSXOpeningFragment };
export function jsxClosingFragment(): t.JSXClosingFragment {
  return builder("JSXClosingFragment", ...arguments);
}
export { jsxClosingFragment as jSXClosingFragment };
export function noop(): t.Noop {
  return builder("Noop", ...arguments);
}
export function placeholder(
  expectedNode:
    | "Identifier"
    | "StringLiteral"
    | "Expression"
    | "Statement"
    | "Declaration"
    | "BlockStatement"
    | "ClassBody"
    | "Pattern",
  name: t.Identifier,
): t.Placeholder {
  return builder("Placeholder", ...arguments);
}
export function v8IntrinsicIdentifier(name: string): t.V8IntrinsicIdentifier {
  return builder("V8IntrinsicIdentifier", ...arguments);
}
export function argumentPlaceholder(): t.ArgumentPlaceholder {
  return builder("ArgumentPlaceholder", ...arguments);
}
export function bindExpression(
  object: t.Expression,
  callee: t.Expression,
): t.BindExpression {
  return builder("BindExpression", ...arguments);
}
export function importAttribute(
  key: t.Identifier | t.StringLiteral,
  value: t.StringLiteral,
): t.ImportAttribute {
  return builder("ImportAttribute", ...arguments);
}
export function decorator(expression: t.Expression): t.Decorator {
  return builder("Decorator", ...arguments);
}
export function doExpression(
  body: t.BlockStatement,
  async?: boolean,
): t.DoExpression {
  return builder("DoExpression", ...arguments);
}
export function exportDefaultSpecifier(
  exported: t.Identifier,
): t.ExportDefaultSpecifier {
  return builder("ExportDefaultSpecifier", ...arguments);
}
export function recordExpression(
  properties: Array<t.ObjectProperty | t.SpreadElement>,
): t.RecordExpression {
  return builder("RecordExpression", ...arguments);
}
export function tupleExpression(
  elements?: Array<t.Expression | t.SpreadElement>,
): t.TupleExpression {
  return builder("TupleExpression", ...arguments);
}
export function decimalLiteral(value: string): t.DecimalLiteral {
  return builder("DecimalLiteral", ...arguments);
}
export function staticBlock(body: Array<t.Statement>): t.StaticBlock {
  return builder("StaticBlock", ...arguments);
}
export function moduleExpression(body: t.Program): t.ModuleExpression {
  return builder("ModuleExpression", ...arguments);
}
export function topicReference(): t.TopicReference {
  return builder("TopicReference", ...arguments);
}
export function pipelineTopicExpression(
  expression: t.Expression,
): t.PipelineTopicExpression {
  return builder("PipelineTopicExpression", ...arguments);
}
export function pipelineBareFunction(
  callee: t.Expression,
): t.PipelineBareFunction {
  return builder("PipelineBareFunction", ...arguments);
}
export function pipelinePrimaryTopicReference(): t.PipelinePrimaryTopicReference {
  return builder("PipelinePrimaryTopicReference", ...arguments);
}
export function tsParameterProperty(
  parameter: t.Identifier | t.AssignmentPattern,
): t.TSParameterProperty {
  return builder("TSParameterProperty", ...arguments);
}
export { tsParameterProperty as tSParameterProperty };
export function tsDeclareFunction(
  id: t.Identifier | null | undefined,
  typeParameters: t.TSTypeParameterDeclaration | t.Noop | null | undefined,
  params: Array<t.Identifier | t.Pattern | t.RestElement>,
  returnType?: t.TSTypeAnnotation | t.Noop | null,
): t.TSDeclareFunction {
  return builder("TSDeclareFunction", ...arguments);
}
export { tsDeclareFunction as tSDeclareFunction };
export function tsDeclareMethod(
  decorators: Array<t.Decorator> | null | undefined,
  key: t.Identifier | t.StringLiteral | t.NumericLiteral | t.Expression,
  typeParameters: t.TSTypeParameterDeclaration | t.Noop | null | undefined,
  params: Array<
    t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty
  >,
  returnType?: t.TSTypeAnnotation | t.Noop | null,
): t.TSDeclareMethod {
  return builder("TSDeclareMethod", ...arguments);
}
export { tsDeclareMethod as tSDeclareMethod };
export function tsQualifiedName(
  left: t.TSEntityName,
  right: t.Identifier,
): t.TSQualifiedName {
  return builder("TSQualifiedName", ...arguments);
}
export { tsQualifiedName as tSQualifiedName };
export function tsCallSignatureDeclaration(
  typeParameters: t.TSTypeParameterDeclaration | null | undefined,
  parameters: Array<t.Identifier | t.RestElement>,
  typeAnnotation?: t.TSTypeAnnotation | null,
): t.TSCallSignatureDeclaration {
  return builder("TSCallSignatureDeclaration", ...arguments);
}
export { tsCallSignatureDeclaration as tSCallSignatureDeclaration };
export function tsConstructSignatureDeclaration(
  typeParameters: t.TSTypeParameterDeclaration | null | undefined,
  parameters: Array<t.Identifier | t.RestElement>,
  typeAnnotation?: t.TSTypeAnnotation | null,
): t.TSConstructSignatureDeclaration {
  return builder("TSConstructSignatureDeclaration", ...arguments);
}
export { tsConstructSignatureDeclaration as tSConstructSignatureDeclaration };
export function tsPropertySignature(
  key: t.Expression,
  typeAnnotation?: t.TSTypeAnnotation | null,
  initializer?: t.Expression | null,
): t.TSPropertySignature {
  return builder("TSPropertySignature", ...arguments);
}
export { tsPropertySignature as tSPropertySignature };
export function tsMethodSignature(
  key: t.Expression,
  typeParameters: t.TSTypeParameterDeclaration | null | undefined,
  parameters: Array<t.Identifier | t.RestElement>,
  typeAnnotation?: t.TSTypeAnnotation | null,
): t.TSMethodSignature {
  return builder("TSMethodSignature", ...arguments);
}
export { tsMethodSignature as tSMethodSignature };
export function tsIndexSignature(
  parameters: Array<t.Identifier>,
  typeAnnotation?: t.TSTypeAnnotation | null,
): t.TSIndexSignature {
  return builder("TSIndexSignature", ...arguments);
}
export { tsIndexSignature as tSIndexSignature };
export function tsAnyKeyword(): t.TSAnyKeyword {
  return builder("TSAnyKeyword", ...arguments);
}
export { tsAnyKeyword as tSAnyKeyword };
export function tsBooleanKeyword(): t.TSBooleanKeyword {
  return builder("TSBooleanKeyword", ...arguments);
}
export { tsBooleanKeyword as tSBooleanKeyword };
export function tsBigIntKeyword(): t.TSBigIntKeyword {
  return builder("TSBigIntKeyword", ...arguments);
}
export { tsBigIntKeyword as tSBigIntKeyword };
export function tsIntrinsicKeyword(): t.TSIntrinsicKeyword {
  return builder("TSIntrinsicKeyword", ...arguments);
}
export { tsIntrinsicKeyword as tSIntrinsicKeyword };
export function tsNeverKeyword(): t.TSNeverKeyword {
  return builder("TSNeverKeyword", ...arguments);
}
export { tsNeverKeyword as tSNeverKeyword };
export function tsNullKeyword(): t.TSNullKeyword {
  return builder("TSNullKeyword", ...arguments);
}
export { tsNullKeyword as tSNullKeyword };
export function tsNumberKeyword(): t.TSNumberKeyword {
  return builder("TSNumberKeyword", ...arguments);
}
export { tsNumberKeyword as tSNumberKeyword };
export function tsObjectKeyword(): t.TSObjectKeyword {
  return builder("TSObjectKeyword", ...arguments);
}
export { tsObjectKeyword as tSObjectKeyword };
export function tsStringKeyword(): t.TSStringKeyword {
  return builder("TSStringKeyword", ...arguments);
}
export { tsStringKeyword as tSStringKeyword };
export function tsSymbolKeyword(): t.TSSymbolKeyword {
  return builder("TSSymbolKeyword", ...arguments);
}
export { tsSymbolKeyword as tSSymbolKeyword };
export function tsUndefinedKeyword(): t.TSUndefinedKeyword {
  return builder("TSUndefinedKeyword", ...arguments);
}
export { tsUndefinedKeyword as tSUndefinedKeyword };
export function tsUnknownKeyword(): t.TSUnknownKeyword {
  return builder("TSUnknownKeyword", ...arguments);
}
export { tsUnknownKeyword as tSUnknownKeyword };
export function tsVoidKeyword(): t.TSVoidKeyword {
  return builder("TSVoidKeyword", ...arguments);
}
export { tsVoidKeyword as tSVoidKeyword };
export function tsThisType(): t.TSThisType {
  return builder("TSThisType", ...arguments);
}
export { tsThisType as tSThisType };
export function tsFunctionType(
  typeParameters: t.TSTypeParameterDeclaration | null | undefined,
  parameters: Array<t.Identifier | t.RestElement>,
  typeAnnotation?: t.TSTypeAnnotation | null,
): t.TSFunctionType {
  return builder("TSFunctionType", ...arguments);
}
export { tsFunctionType as tSFunctionType };
export function tsConstructorType(
  typeParameters: t.TSTypeParameterDeclaration | null | undefined,
  parameters: Array<t.Identifier | t.RestElement>,
  typeAnnotation?: t.TSTypeAnnotation | null,
): t.TSConstructorType {
  return builder("TSConstructorType", ...arguments);
}
export { tsConstructorType as tSConstructorType };
export function tsTypeReference(
  typeName: t.TSEntityName,
  typeParameters?: t.TSTypeParameterInstantiation | null,
): t.TSTypeReference {
  return builder("TSTypeReference", ...arguments);
}
export { tsTypeReference as tSTypeReference };
export function tsTypePredicate(
  parameterName: t.Identifier | t.TSThisType,
  typeAnnotation?: t.TSTypeAnnotation | null,
  asserts?: boolean | null,
): t.TSTypePredicate {
  return builder("TSTypePredicate", ...arguments);
}
export { tsTypePredicate as tSTypePredicate };
export function tsTypeQuery(
  exprName: t.TSEntityName | t.TSImportType,
): t.TSTypeQuery {
  return builder("TSTypeQuery", ...arguments);
}
export { tsTypeQuery as tSTypeQuery };
export function tsTypeLiteral(
  members: Array<t.TSTypeElement>,
): t.TSTypeLiteral {
  return builder("TSTypeLiteral", ...arguments);
}
export { tsTypeLiteral as tSTypeLiteral };
export function tsArrayType(elementType: t.TSType): t.TSArrayType {
  return builder("TSArrayType", ...arguments);
}
export { tsArrayType as tSArrayType };
export function tsTupleType(
  elementTypes: Array<t.TSType | t.TSNamedTupleMember>,
): t.TSTupleType {
  return builder("TSTupleType", ...arguments);
}
export { tsTupleType as tSTupleType };
export function tsOptionalType(typeAnnotation: t.TSType): t.TSOptionalType {
  return builder("TSOptionalType", ...arguments);
}
export { tsOptionalType as tSOptionalType };
export function tsRestType(typeAnnotation: t.TSType): t.TSRestType {
  return builder("TSRestType", ...arguments);
}
export { tsRestType as tSRestType };
export function tsNamedTupleMember(
  label: t.Identifier,
  elementType: t.TSType,
  optional?: boolean,
): t.TSNamedTupleMember {
  return builder("TSNamedTupleMember", ...arguments);
}
export { tsNamedTupleMember as tSNamedTupleMember };
export function tsUnionType(types: Array<t.TSType>): t.TSUnionType {
  return builder("TSUnionType", ...arguments);
}
export { tsUnionType as tSUnionType };
export function tsIntersectionType(
  types: Array<t.TSType>,
): t.TSIntersectionType {
  return builder("TSIntersectionType", ...arguments);
}
export { tsIntersectionType as tSIntersectionType };
export function tsConditionalType(
  checkType: t.TSType,
  extendsType: t.TSType,
  trueType: t.TSType,
  falseType: t.TSType,
): t.TSConditionalType {
  return builder("TSConditionalType", ...arguments);
}
export { tsConditionalType as tSConditionalType };
export function tsInferType(typeParameter: t.TSTypeParameter): t.TSInferType {
  return builder("TSInferType", ...arguments);
}
export { tsInferType as tSInferType };
export function tsParenthesizedType(
  typeAnnotation: t.TSType,
): t.TSParenthesizedType {
  return builder("TSParenthesizedType", ...arguments);
}
export { tsParenthesizedType as tSParenthesizedType };
export function tsTypeOperator(typeAnnotation: t.TSType): t.TSTypeOperator {
  return builder("TSTypeOperator", ...arguments);
}
export { tsTypeOperator as tSTypeOperator };
export function tsIndexedAccessType(
  objectType: t.TSType,
  indexType: t.TSType,
): t.TSIndexedAccessType {
  return builder("TSIndexedAccessType", ...arguments);
}
export { tsIndexedAccessType as tSIndexedAccessType };
export function tsMappedType(
  typeParameter: t.TSTypeParameter,
  typeAnnotation?: t.TSType | null,
  nameType?: t.TSType | null,
): t.TSMappedType {
  return builder("TSMappedType", ...arguments);
}
export { tsMappedType as tSMappedType };
export function tsLiteralType(
  literal:
    | t.NumericLiteral
    | t.StringLiteral
    | t.BooleanLiteral
    | t.BigIntLiteral
    | t.UnaryExpression,
): t.TSLiteralType {
  return builder("TSLiteralType", ...arguments);
}
export { tsLiteralType as tSLiteralType };
export function tsExpressionWithTypeArguments(
  expression: t.TSEntityName,
  typeParameters?: t.TSTypeParameterInstantiation | null,
): t.TSExpressionWithTypeArguments {
  return builder("TSExpressionWithTypeArguments", ...arguments);
}
export { tsExpressionWithTypeArguments as tSExpressionWithTypeArguments };
export function tsInterfaceDeclaration(
  id: t.Identifier,
  typeParameters: t.TSTypeParameterDeclaration | null | undefined,
  _extends: Array<t.TSExpressionWithTypeArguments> | null | undefined,
  body: t.TSInterfaceBody,
): t.TSInterfaceDeclaration {
  return builder("TSInterfaceDeclaration", ...arguments);
}
export { tsInterfaceDeclaration as tSInterfaceDeclaration };
export function tsInterfaceBody(
  body: Array<t.TSTypeElement>,
): t.TSInterfaceBody {
  return builder("TSInterfaceBody", ...arguments);
}
export { tsInterfaceBody as tSInterfaceBody };
export function tsTypeAliasDeclaration(
  id: t.Identifier,
  typeParameters: t.TSTypeParameterDeclaration | null | undefined,
  typeAnnotation: t.TSType,
): t.TSTypeAliasDeclaration {
  return builder("TSTypeAliasDeclaration", ...arguments);
}
export { tsTypeAliasDeclaration as tSTypeAliasDeclaration };
export function tsAsExpression(
  expression: t.Expression,
  typeAnnotation: t.TSType,
): t.TSAsExpression {
  return builder("TSAsExpression", ...arguments);
}
export { tsAsExpression as tSAsExpression };
export function tsTypeAssertion(
  typeAnnotation: t.TSType,
  expression: t.Expression,
): t.TSTypeAssertion {
  return builder("TSTypeAssertion", ...arguments);
}
export { tsTypeAssertion as tSTypeAssertion };
export function tsEnumDeclaration(
  id: t.Identifier,
  members: Array<t.TSEnumMember>,
): t.TSEnumDeclaration {
  return builder("TSEnumDeclaration", ...arguments);
}
export { tsEnumDeclaration as tSEnumDeclaration };
export function tsEnumMember(
  id: t.Identifier | t.StringLiteral,
  initializer?: t.Expression | null,
): t.TSEnumMember {
  return builder("TSEnumMember", ...arguments);
}
export { tsEnumMember as tSEnumMember };
export function tsModuleDeclaration(
  id: t.Identifier | t.StringLiteral,
  body: t.TSModuleBlock | t.TSModuleDeclaration,
): t.TSModuleDeclaration {
  return builder("TSModuleDeclaration", ...arguments);
}
export { tsModuleDeclaration as tSModuleDeclaration };
export function tsModuleBlock(body: Array<t.Statement>): t.TSModuleBlock {
  return builder("TSModuleBlock", ...arguments);
}
export { tsModuleBlock as tSModuleBlock };
export function tsImportType(
  argument: t.StringLiteral,
  qualifier?: t.TSEntityName | null,
  typeParameters?: t.TSTypeParameterInstantiation | null,
): t.TSImportType {
  return builder("TSImportType", ...arguments);
}
export { tsImportType as tSImportType };
export function tsImportEqualsDeclaration(
  id: t.Identifier,
  moduleReference: t.TSEntityName | t.TSExternalModuleReference,
): t.TSImportEqualsDeclaration {
  return builder("TSImportEqualsDeclaration", ...arguments);
}
export { tsImportEqualsDeclaration as tSImportEqualsDeclaration };
export function tsExternalModuleReference(
  expression: t.StringLiteral,
): t.TSExternalModuleReference {
  return builder("TSExternalModuleReference", ...arguments);
}
export { tsExternalModuleReference as tSExternalModuleReference };
export function tsNonNullExpression(
  expression: t.Expression,
): t.TSNonNullExpression {
  return builder("TSNonNullExpression", ...arguments);
}
export { tsNonNullExpression as tSNonNullExpression };
export function tsExportAssignment(
  expression: t.Expression,
): t.TSExportAssignment {
  return builder("TSExportAssignment", ...arguments);
}
export { tsExportAssignment as tSExportAssignment };
export function tsNamespaceExportDeclaration(
  id: t.Identifier,
): t.TSNamespaceExportDeclaration {
  return builder("TSNamespaceExportDeclaration", ...arguments);
}
export { tsNamespaceExportDeclaration as tSNamespaceExportDeclaration };
export function tsTypeAnnotation(typeAnnotation: t.TSType): t.TSTypeAnnotation {
  return builder("TSTypeAnnotation", ...arguments);
}
export { tsTypeAnnotation as tSTypeAnnotation };
export function tsTypeParameterInstantiation(
  params: Array<t.TSType>,
): t.TSTypeParameterInstantiation {
  return builder("TSTypeParameterInstantiation", ...arguments);
}
export { tsTypeParameterInstantiation as tSTypeParameterInstantiation };
export function tsTypeParameterDeclaration(
  params: Array<t.TSTypeParameter>,
): t.TSTypeParameterDeclaration {
  return builder("TSTypeParameterDeclaration", ...arguments);
}
export { tsTypeParameterDeclaration as tSTypeParameterDeclaration };
export function tsTypeParameter(
  constraint: t.TSType | null | undefined,
  _default: t.TSType | null | undefined,
  name: string,
): t.TSTypeParameter {
  return builder("TSTypeParameter", ...arguments);
}
export { tsTypeParameter as tSTypeParameter };
/** @deprecated */
function NumberLiteral(...args: Array<any>): any {
  console.trace(
    "The node type NumberLiteral has been renamed to NumericLiteral",
  );
  return builder("NumberLiteral", ...args);
}
export { NumberLiteral as numberLiteral };
/** @deprecated */
function RegexLiteral(...args: Array<any>): any {
  console.trace("The node type RegexLiteral has been renamed to RegExpLiteral");
  return builder("RegexLiteral", ...args);
}
export { RegexLiteral as regexLiteral };
/** @deprecated */
function RestProperty(...args: Array<any>): any {
  console.trace("The node type RestProperty has been renamed to RestElement");
  return builder("RestProperty", ...args);
}
export { RestProperty as restProperty };
/** @deprecated */
function SpreadProperty(...args: Array<any>): any {
  console.trace(
    "The node type SpreadProperty has been renamed to SpreadElement",
  );
  return builder("SpreadProperty", ...args);
}
export { SpreadProperty as spreadProperty };
