/*
 * This file is auto-generated! Do not modify it directly.
 * To re-generate run 'make build'
 */
import validateNode from "../validateNode";
import type * as t from "../..";

/* eslint-disable @typescript-eslint/no-unused-vars */

export function arrayExpression(
  elements: Array<null | t.Expression | t.SpreadElement> = [],
) {
  const node = {
    type: "ArrayExpression",
    elements: elements,
  } as t.ArrayExpression;
  validateNode(node);
  return node;
}
export function assignmentExpression(
  operator: string,
  left: t.LVal,
  right: t.Expression,
) {
  const node = {
    type: "AssignmentExpression",
    operator: operator,
    left: left,
    right: right,
  } as t.AssignmentExpression;
  validateNode(node);
  return node;
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
) {
  const node = {
    type: "BinaryExpression",
    operator: operator,
    left: left,
    right: right,
  } as t.BinaryExpression;
  validateNode(node);
  return node;
}
export function interpreterDirective(value: string) {
  const node = {
    type: "InterpreterDirective",
    value: value,
  } as t.InterpreterDirective;
  validateNode(node);
  return node;
}
export function directive(value: t.DirectiveLiteral) {
  const node = {
    type: "Directive",
    value: value,
  } as t.Directive;
  validateNode(node);
  return node;
}
export function directiveLiteral(value: string) {
  const node = {
    type: "DirectiveLiteral",
    value: value,
  } as t.DirectiveLiteral;
  validateNode(node);
  return node;
}
export function blockStatement(
  body: Array<t.Statement>,
  directives: Array<t.Directive> = [],
) {
  const node = {
    type: "BlockStatement",
    body: body,
    directives: directives,
  } as t.BlockStatement;
  validateNode(node);
  return node;
}
export function breakStatement(label: t.Identifier | null = null) {
  const node = {
    type: "BreakStatement",
    label: label,
  } as t.BreakStatement;
  validateNode(node);
  return node;
}
export function callExpression(
  callee: t.Expression | t.V8IntrinsicIdentifier,
  _arguments: Array<
    t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ArgumentPlaceholder
  >,
) {
  const node = {
    type: "CallExpression",
    callee: callee,
    arguments: _arguments,
    optional: null,
    typeArguments: null,
    typeParameters: null,
  } as t.CallExpression;
  validateNode(node);
  return node;
}
export function catchClause(
  param: t.Identifier | t.ArrayPattern | t.ObjectPattern | null | undefined,
  body: t.BlockStatement,
) {
  const node = {
    type: "CatchClause",
    param: param,
    body: body,
  } as t.CatchClause;
  validateNode(node);
  return node;
}
export function conditionalExpression(
  test: t.Expression,
  consequent: t.Expression,
  alternate: t.Expression,
) {
  const node = {
    type: "ConditionalExpression",
    test: test,
    consequent: consequent,
    alternate: alternate,
  } as t.ConditionalExpression;
  validateNode(node);
  return node;
}
export function continueStatement(label: t.Identifier | null = null) {
  const node = {
    type: "ContinueStatement",
    label: label,
  } as t.ContinueStatement;
  validateNode(node);
  return node;
}
export function debuggerStatement() {
  const node = {
    type: "DebuggerStatement",
  } as t.DebuggerStatement;
  validateNode(node);
  return node;
}
export function doWhileStatement(test: t.Expression, body: t.Statement) {
  const node = {
    type: "DoWhileStatement",
    test: test,
    body: body,
  } as t.DoWhileStatement;
  validateNode(node);
  return node;
}
export function emptyStatement() {
  const node = {
    type: "EmptyStatement",
  } as t.EmptyStatement;
  validateNode(node);
  return node;
}
export function expressionStatement(expression: t.Expression) {
  const node = {
    type: "ExpressionStatement",
    expression: expression,
  } as t.ExpressionStatement;
  validateNode(node);
  return node;
}
export function file(
  program: t.Program,
  comments: Array<t.CommentBlock | t.CommentLine> | null = null,
  tokens: Array<any> | null = null,
) {
  const node = {
    type: "File",
    program: program,
    comments: comments,
    tokens: tokens,
  } as t.File;
  validateNode(node);
  return node;
}
export function forInStatement(
  left: t.VariableDeclaration | t.LVal,
  right: t.Expression,
  body: t.Statement,
) {
  const node = {
    type: "ForInStatement",
    left: left,
    right: right,
    body: body,
  } as t.ForInStatement;
  validateNode(node);
  return node;
}
export function forStatement(
  init: t.VariableDeclaration | t.Expression | null | undefined,
  test: t.Expression | null | undefined,
  update: t.Expression | null | undefined,
  body: t.Statement,
) {
  const node = {
    type: "ForStatement",
    init: init,
    test: test,
    update: update,
    body: body,
  } as t.ForStatement;
  validateNode(node);
  return node;
}
export function functionDeclaration(
  id: t.Identifier | null | undefined,
  params: Array<t.Identifier | t.Pattern | t.RestElement>,
  body: t.BlockStatement,
  generator: boolean = false,
  async: boolean = false,
) {
  const node = {
    type: "FunctionDeclaration",
    id: id,
    params: params,
    body: body,
    generator: generator,
    async: async,
    declare: null,
    returnType: null,
    typeParameters: null,
  } as t.FunctionDeclaration;
  validateNode(node);
  return node;
}
export function functionExpression(
  id: t.Identifier | null | undefined,
  params: Array<t.Identifier | t.Pattern | t.RestElement>,
  body: t.BlockStatement,
  generator: boolean = false,
  async: boolean = false,
) {
  const node = {
    type: "FunctionExpression",
    id: id,
    params: params,
    body: body,
    generator: generator,
    async: async,
    returnType: null,
    typeParameters: null,
  } as t.FunctionExpression;
  validateNode(node);
  return node;
}
export function identifier(name: string) {
  const node = {
    type: "Identifier",
    name: name,
    decorators: null,
    optional: null,
    typeAnnotation: null,
  } as t.Identifier;
  validateNode(node);
  return node;
}
export function ifStatement(
  test: t.Expression,
  consequent: t.Statement,
  alternate: t.Statement | null = null,
) {
  const node = {
    type: "IfStatement",
    test: test,
    consequent: consequent,
    alternate: alternate,
  } as t.IfStatement;
  validateNode(node);
  return node;
}
export function labeledStatement(label: t.Identifier, body: t.Statement) {
  const node = {
    type: "LabeledStatement",
    label: label,
    body: body,
  } as t.LabeledStatement;
  validateNode(node);
  return node;
}
export function stringLiteral(value: string) {
  const node = {
    type: "StringLiteral",
    value: value,
  } as t.StringLiteral;
  validateNode(node);
  return node;
}
export function numericLiteral(value: number) {
  const node = {
    type: "NumericLiteral",
    value: value,
  } as t.NumericLiteral;
  validateNode(node);
  return node;
}
export function nullLiteral() {
  const node = {
    type: "NullLiteral",
  } as t.NullLiteral;
  validateNode(node);
  return node;
}
export function booleanLiteral(value: boolean) {
  const node = {
    type: "BooleanLiteral",
    value: value,
  } as t.BooleanLiteral;
  validateNode(node);
  return node;
}
export function regExpLiteral(pattern: string, flags: string = "") {
  const node = {
    type: "RegExpLiteral",
    pattern: pattern,
    flags: flags,
  } as t.RegExpLiteral;
  validateNode(node);
  return node;
}
export function logicalExpression(
  operator: "||" | "&&" | "??",
  left: t.Expression,
  right: t.Expression,
) {
  const node = {
    type: "LogicalExpression",
    operator: operator,
    left: left,
    right: right,
  } as t.LogicalExpression;
  validateNode(node);
  return node;
}
export function memberExpression(
  object: t.Expression,
  property: t.Expression | t.Identifier | t.PrivateName,
  computed: boolean = false,
  optional: true | false | null = null,
) {
  const node = {
    type: "MemberExpression",
    object: object,
    property: property,
    computed: computed,
    optional: optional,
  } as t.MemberExpression;
  validateNode(node);
  return node;
}
export function newExpression(
  callee: t.Expression | t.V8IntrinsicIdentifier,
  _arguments: Array<
    t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ArgumentPlaceholder
  >,
) {
  const node = {
    type: "NewExpression",
    callee: callee,
    arguments: _arguments,
    optional: null,
    typeArguments: null,
    typeParameters: null,
  } as t.NewExpression;
  validateNode(node);
  return node;
}
export function program(
  body: Array<t.Statement>,
  directives: Array<t.Directive> = [],
  sourceType: "script" | "module" = "script",
  interpreter: t.InterpreterDirective | null = null,
) {
  const node = {
    type: "Program",
    body: body,
    directives: directives,
    sourceType: sourceType,
    interpreter: interpreter,
    sourceFile: null,
  } as t.Program;
  validateNode(node);
  return node;
}
export function objectExpression(
  properties: Array<t.ObjectMethod | t.ObjectProperty | t.SpreadElement>,
) {
  const node = {
    type: "ObjectExpression",
    properties: properties,
  } as t.ObjectExpression;
  validateNode(node);
  return node;
}
export function objectMethod(
  kind: "method" | "get" | "set" | undefined,
  key: t.Expression | t.Identifier | t.StringLiteral | t.NumericLiteral,
  params: Array<t.Identifier | t.Pattern | t.RestElement>,
  body: t.BlockStatement,
  computed: boolean = false,
  generator: boolean = false,
  async: boolean = false,
) {
  const node = {
    type: "ObjectMethod",
    kind: kind,
    key: key,
    params: params,
    body: body,
    computed: computed,
    generator: generator,
    async: async,
    decorators: null,
    returnType: null,
    typeParameters: null,
  } as t.ObjectMethod;
  validateNode(node);
  return node;
}
export function objectProperty(
  key: t.Expression | t.Identifier | t.StringLiteral | t.NumericLiteral,
  value: t.Expression | t.PatternLike,
  computed: boolean = false,
  shorthand: boolean = false,
  decorators: Array<t.Decorator> | null = null,
) {
  const node = {
    type: "ObjectProperty",
    key: key,
    value: value,
    computed: computed,
    shorthand: shorthand,
    decorators: decorators,
  } as t.ObjectProperty;
  validateNode(node);
  return node;
}
export function restElement(argument: t.LVal) {
  const node = {
    type: "RestElement",
    argument: argument,
    decorators: null,
    typeAnnotation: null,
  } as t.RestElement;
  validateNode(node);
  return node;
}
export function returnStatement(argument: t.Expression | null = null) {
  const node = {
    type: "ReturnStatement",
    argument: argument,
  } as t.ReturnStatement;
  validateNode(node);
  return node;
}
export function sequenceExpression(expressions: Array<t.Expression>) {
  const node = {
    type: "SequenceExpression",
    expressions: expressions,
  } as t.SequenceExpression;
  validateNode(node);
  return node;
}
export function parenthesizedExpression(expression: t.Expression) {
  const node = {
    type: "ParenthesizedExpression",
    expression: expression,
  } as t.ParenthesizedExpression;
  validateNode(node);
  return node;
}
export function switchCase(
  test: t.Expression | null | undefined,
  consequent: Array<t.Statement>,
) {
  const node = {
    type: "SwitchCase",
    test: test,
    consequent: consequent,
  } as t.SwitchCase;
  validateNode(node);
  return node;
}
export function switchStatement(
  discriminant: t.Expression,
  cases: Array<t.SwitchCase>,
) {
  const node = {
    type: "SwitchStatement",
    discriminant: discriminant,
    cases: cases,
  } as t.SwitchStatement;
  validateNode(node);
  return node;
}
export function thisExpression() {
  const node = {
    type: "ThisExpression",
  } as t.ThisExpression;
  validateNode(node);
  return node;
}
export function throwStatement(argument: t.Expression) {
  const node = {
    type: "ThrowStatement",
    argument: argument,
  } as t.ThrowStatement;
  validateNode(node);
  return node;
}
export function tryStatement(
  block: t.BlockStatement,
  handler: t.CatchClause | null = null,
  finalizer: t.BlockStatement | null = null,
) {
  const node = {
    type: "TryStatement",
    block: block,
    handler: handler,
    finalizer: finalizer,
  } as t.TryStatement;
  validateNode(node);
  return node;
}
export function unaryExpression(
  operator: "void" | "throw" | "delete" | "!" | "+" | "-" | "~" | "typeof",
  argument: t.Expression,
  prefix: boolean = true,
) {
  const node = {
    type: "UnaryExpression",
    operator: operator,
    argument: argument,
    prefix: prefix,
  } as t.UnaryExpression;
  validateNode(node);
  return node;
}
export function updateExpression(
  operator: "++" | "--",
  argument: t.Expression,
  prefix: boolean = false,
) {
  const node = {
    type: "UpdateExpression",
    operator: operator,
    argument: argument,
    prefix: prefix,
  } as t.UpdateExpression;
  validateNode(node);
  return node;
}
export function variableDeclaration(
  kind: "var" | "let" | "const",
  declarations: Array<t.VariableDeclarator>,
) {
  const node = {
    type: "VariableDeclaration",
    kind: kind,
    declarations: declarations,
    declare: null,
  } as t.VariableDeclaration;
  validateNode(node);
  return node;
}
export function variableDeclarator(
  id: t.LVal,
  init: t.Expression | null = null,
) {
  const node = {
    type: "VariableDeclarator",
    id: id,
    init: init,
    definite: null,
  } as t.VariableDeclarator;
  validateNode(node);
  return node;
}
export function whileStatement(test: t.Expression, body: t.Statement) {
  const node = {
    type: "WhileStatement",
    test: test,
    body: body,
  } as t.WhileStatement;
  validateNode(node);
  return node;
}
export function withStatement(object: t.Expression, body: t.Statement) {
  const node = {
    type: "WithStatement",
    object: object,
    body: body,
  } as t.WithStatement;
  validateNode(node);
  return node;
}
export function assignmentPattern(
  left: t.Identifier | t.ObjectPattern | t.ArrayPattern | t.MemberExpression,
  right: t.Expression,
) {
  const node = {
    type: "AssignmentPattern",
    left: left,
    right: right,
    decorators: null,
    typeAnnotation: null,
  } as t.AssignmentPattern;
  validateNode(node);
  return node;
}
export function arrayPattern(elements: Array<null | t.PatternLike>) {
  const node = {
    type: "ArrayPattern",
    elements: elements,
    decorators: null,
    typeAnnotation: null,
  } as t.ArrayPattern;
  validateNode(node);
  return node;
}
export function arrowFunctionExpression(
  params: Array<t.Identifier | t.Pattern | t.RestElement>,
  body: t.BlockStatement | t.Expression,
  async: boolean = false,
) {
  const node = {
    type: "ArrowFunctionExpression",
    params: params,
    body: body,
    async: async,
    expression: null,
    generator: false,
    returnType: null,
    typeParameters: null,
  } as t.ArrowFunctionExpression;
  validateNode(node);
  return node;
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
) {
  const node = {
    type: "ClassBody",
    body: body,
  } as t.ClassBody;
  validateNode(node);
  return node;
}
export function classExpression(
  id: t.Identifier | null | undefined,
  superClass: t.Expression | null | undefined,
  body: t.ClassBody,
  decorators: Array<t.Decorator> | null = null,
) {
  const node = {
    type: "ClassExpression",
    id: id,
    superClass: superClass,
    body: body,
    decorators: decorators,
    implements: null,
    mixins: null,
    superTypeParameters: null,
    typeParameters: null,
  } as t.ClassExpression;
  validateNode(node);
  return node;
}
export function classDeclaration(
  id: t.Identifier,
  superClass: t.Expression | null | undefined,
  body: t.ClassBody,
  decorators: Array<t.Decorator> | null = null,
) {
  const node = {
    type: "ClassDeclaration",
    id: id,
    superClass: superClass,
    body: body,
    decorators: decorators,
    abstract: null,
    declare: null,
    implements: null,
    mixins: null,
    superTypeParameters: null,
    typeParameters: null,
  } as t.ClassDeclaration;
  validateNode(node);
  return node;
}
export function exportAllDeclaration(source: t.StringLiteral) {
  const node = {
    type: "ExportAllDeclaration",
    source: source,
    assertions: null,
    exportKind: null,
  } as t.ExportAllDeclaration;
  validateNode(node);
  return node;
}
export function exportDefaultDeclaration(
  declaration:
    | t.FunctionDeclaration
    | t.TSDeclareFunction
    | t.ClassDeclaration
    | t.Expression,
) {
  const node = {
    type: "ExportDefaultDeclaration",
    declaration: declaration,
  } as t.ExportDefaultDeclaration;
  validateNode(node);
  return node;
}
export function exportNamedDeclaration(
  declaration: t.Declaration | null = null,
  specifiers: Array<
    t.ExportSpecifier | t.ExportDefaultSpecifier | t.ExportNamespaceSpecifier
  > = [],
  source: t.StringLiteral | null = null,
) {
  const node = {
    type: "ExportNamedDeclaration",
    declaration: declaration,
    specifiers: specifiers,
    source: source,
    assertions: null,
    exportKind: null,
  } as t.ExportNamedDeclaration;
  validateNode(node);
  return node;
}
export function exportSpecifier(
  local: t.Identifier,
  exported: t.Identifier | t.StringLiteral,
) {
  const node = {
    type: "ExportSpecifier",
    local: local,
    exported: exported,
  } as t.ExportSpecifier;
  validateNode(node);
  return node;
}
export function forOfStatement(
  left: t.VariableDeclaration | t.LVal,
  right: t.Expression,
  body: t.Statement,
  _await: boolean = false,
) {
  const node = {
    type: "ForOfStatement",
    left: left,
    right: right,
    body: body,
    await: _await,
  } as t.ForOfStatement;
  validateNode(node);
  return node;
}
export function importDeclaration(
  specifiers: Array<
    t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier
  >,
  source: t.StringLiteral,
) {
  const node = {
    type: "ImportDeclaration",
    specifiers: specifiers,
    source: source,
    assertions: null,
    importKind: null,
  } as t.ImportDeclaration;
  validateNode(node);
  return node;
}
export function importDefaultSpecifier(local: t.Identifier) {
  const node = {
    type: "ImportDefaultSpecifier",
    local: local,
  } as t.ImportDefaultSpecifier;
  validateNode(node);
  return node;
}
export function importNamespaceSpecifier(local: t.Identifier) {
  const node = {
    type: "ImportNamespaceSpecifier",
    local: local,
  } as t.ImportNamespaceSpecifier;
  validateNode(node);
  return node;
}
export function importSpecifier(
  local: t.Identifier,
  imported: t.Identifier | t.StringLiteral,
) {
  const node = {
    type: "ImportSpecifier",
    local: local,
    imported: imported,
    importKind: null,
  } as t.ImportSpecifier;
  validateNode(node);
  return node;
}
export function metaProperty(meta: t.Identifier, property: t.Identifier) {
  const node = {
    type: "MetaProperty",
    meta: meta,
    property: property,
  } as t.MetaProperty;
  validateNode(node);
  return node;
}
export function classMethod(
  kind: "get" | "set" | "method" | "constructor" | undefined,
  key: t.Identifier | t.StringLiteral | t.NumericLiteral | t.Expression,
  params: Array<
    t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty
  >,
  body: t.BlockStatement,
  computed: boolean = false,
  _static: boolean = false,
  generator: boolean = false,
  async: boolean = false,
) {
  const node = {
    type: "ClassMethod",
    kind: kind,
    key: key,
    params: params,
    body: body,
    computed: computed,
    static: _static,
    generator: generator,
    async: async,
    abstract: null,
    access: null,
    accessibility: null,
    decorators: null,
    optional: null,
    override: false,
    returnType: null,
    typeParameters: null,
  } as t.ClassMethod;
  validateNode(node);
  return node;
}
export function objectPattern(
  properties: Array<t.RestElement | t.ObjectProperty>,
) {
  const node = {
    type: "ObjectPattern",
    properties: properties,
    decorators: null,
    typeAnnotation: null,
  } as t.ObjectPattern;
  validateNode(node);
  return node;
}
export function spreadElement(argument: t.Expression) {
  const node = {
    type: "SpreadElement",
    argument: argument,
  } as t.SpreadElement;
  validateNode(node);
  return node;
}
function _super() {
  const node = {
    type: "Super",
  } as t.Super;
  validateNode(node);
  return node;
}
export { _super as super };
export function taggedTemplateExpression(
  tag: t.Expression,
  quasi: t.TemplateLiteral,
) {
  const node = {
    type: "TaggedTemplateExpression",
    tag: tag,
    quasi: quasi,
    typeParameters: null,
  } as t.TaggedTemplateExpression;
  validateNode(node);
  return node;
}
export function templateElement(
  value: { raw: string; cooked?: string },
  tail: boolean = false,
) {
  const node = {
    type: "TemplateElement",
    value: value,
    tail: tail,
  } as t.TemplateElement;
  validateNode(node);
  return node;
}
export function templateLiteral(
  quasis: Array<t.TemplateElement>,
  expressions: Array<t.Expression | t.TSType>,
) {
  const node = {
    type: "TemplateLiteral",
    quasis: quasis,
    expressions: expressions,
  } as t.TemplateLiteral;
  validateNode(node);
  return node;
}
export function yieldExpression(
  argument: t.Expression | null = null,
  delegate: boolean = false,
) {
  const node = {
    type: "YieldExpression",
    argument: argument,
    delegate: delegate,
  } as t.YieldExpression;
  validateNode(node);
  return node;
}
export function awaitExpression(argument: t.Expression) {
  const node = {
    type: "AwaitExpression",
    argument: argument,
  } as t.AwaitExpression;
  validateNode(node);
  return node;
}
function _import() {
  const node = {
    type: "Import",
  } as t.Import;
  validateNode(node);
  return node;
}
export { _import as import };
export function bigIntLiteral(value: string) {
  const node = {
    type: "BigIntLiteral",
    value: value,
  } as t.BigIntLiteral;
  validateNode(node);
  return node;
}
export function exportNamespaceSpecifier(exported: t.Identifier) {
  const node = {
    type: "ExportNamespaceSpecifier",
    exported: exported,
  } as t.ExportNamespaceSpecifier;
  validateNode(node);
  return node;
}
export function optionalMemberExpression(
  object: t.Expression,
  property: t.Expression | t.Identifier,
  computed: boolean | undefined,
  optional: boolean,
) {
  const node = {
    type: "OptionalMemberExpression",
    object: object,
    property: property,
    computed: computed,
    optional: optional,
  } as t.OptionalMemberExpression;
  validateNode(node);
  return node;
}
export function optionalCallExpression(
  callee: t.Expression,
  _arguments: Array<
    t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ArgumentPlaceholder
  >,
  optional: boolean,
) {
  const node = {
    type: "OptionalCallExpression",
    callee: callee,
    arguments: _arguments,
    optional: optional,
    typeArguments: null,
    typeParameters: null,
  } as t.OptionalCallExpression;
  validateNode(node);
  return node;
}
export function anyTypeAnnotation() {
  const node = {
    type: "AnyTypeAnnotation",
  } as t.AnyTypeAnnotation;
  validateNode(node);
  return node;
}
export function arrayTypeAnnotation(elementType: t.FlowType) {
  const node = {
    type: "ArrayTypeAnnotation",
    elementType: elementType,
  } as t.ArrayTypeAnnotation;
  validateNode(node);
  return node;
}
export function booleanTypeAnnotation() {
  const node = {
    type: "BooleanTypeAnnotation",
  } as t.BooleanTypeAnnotation;
  validateNode(node);
  return node;
}
export function booleanLiteralTypeAnnotation(value: boolean) {
  const node = {
    type: "BooleanLiteralTypeAnnotation",
    value: value,
  } as t.BooleanLiteralTypeAnnotation;
  validateNode(node);
  return node;
}
export function nullLiteralTypeAnnotation() {
  const node = {
    type: "NullLiteralTypeAnnotation",
  } as t.NullLiteralTypeAnnotation;
  validateNode(node);
  return node;
}
export function classImplements(
  id: t.Identifier,
  typeParameters: t.TypeParameterInstantiation | null = null,
) {
  const node = {
    type: "ClassImplements",
    id: id,
    typeParameters: typeParameters,
  } as t.ClassImplements;
  validateNode(node);
  return node;
}
export function declareClass(
  id: t.Identifier,
  typeParameters: t.TypeParameterDeclaration | null | undefined,
  _extends: Array<t.InterfaceExtends> | null | undefined,
  body: t.ObjectTypeAnnotation,
) {
  const node = {
    type: "DeclareClass",
    id: id,
    typeParameters: typeParameters,
    extends: _extends,
    body: body,
    implements: null,
    mixins: null,
  } as t.DeclareClass;
  validateNode(node);
  return node;
}
export function declareFunction(id: t.Identifier) {
  const node = {
    type: "DeclareFunction",
    id: id,
    predicate: null,
  } as t.DeclareFunction;
  validateNode(node);
  return node;
}
export function declareInterface(
  id: t.Identifier,
  typeParameters: t.TypeParameterDeclaration | null | undefined,
  _extends: Array<t.InterfaceExtends> | null | undefined,
  body: t.ObjectTypeAnnotation,
) {
  const node = {
    type: "DeclareInterface",
    id: id,
    typeParameters: typeParameters,
    extends: _extends,
    body: body,
    implements: null,
    mixins: null,
  } as t.DeclareInterface;
  validateNode(node);
  return node;
}
export function declareModule(
  id: t.Identifier | t.StringLiteral,
  body: t.BlockStatement,
  kind: "CommonJS" | "ES" | null = null,
) {
  const node = {
    type: "DeclareModule",
    id: id,
    body: body,
    kind: kind,
  } as t.DeclareModule;
  validateNode(node);
  return node;
}
export function declareModuleExports(typeAnnotation: t.TypeAnnotation) {
  const node = {
    type: "DeclareModuleExports",
    typeAnnotation: typeAnnotation,
  } as t.DeclareModuleExports;
  validateNode(node);
  return node;
}
export function declareTypeAlias(
  id: t.Identifier,
  typeParameters: t.TypeParameterDeclaration | null | undefined,
  right: t.FlowType,
) {
  const node = {
    type: "DeclareTypeAlias",
    id: id,
    typeParameters: typeParameters,
    right: right,
  } as t.DeclareTypeAlias;
  validateNode(node);
  return node;
}
export function declareOpaqueType(
  id: t.Identifier,
  typeParameters: t.TypeParameterDeclaration | null = null,
  supertype: t.FlowType | null = null,
) {
  const node = {
    type: "DeclareOpaqueType",
    id: id,
    typeParameters: typeParameters,
    supertype: supertype,
  } as t.DeclareOpaqueType;
  validateNode(node);
  return node;
}
export function declareVariable(id: t.Identifier) {
  const node = {
    type: "DeclareVariable",
    id: id,
  } as t.DeclareVariable;
  validateNode(node);
  return node;
}
export function declareExportDeclaration(
  declaration: t.Flow | null = null,
  specifiers: Array<
    t.ExportSpecifier | t.ExportNamespaceSpecifier
  > | null = null,
  source: t.StringLiteral | null = null,
) {
  const node = {
    type: "DeclareExportDeclaration",
    declaration: declaration,
    specifiers: specifiers,
    source: source,
    default: null,
  } as t.DeclareExportDeclaration;
  validateNode(node);
  return node;
}
export function declareExportAllDeclaration(source: t.StringLiteral) {
  const node = {
    type: "DeclareExportAllDeclaration",
    source: source,
    exportKind: null,
  } as t.DeclareExportAllDeclaration;
  validateNode(node);
  return node;
}
export function declaredPredicate(value: t.Flow) {
  const node = {
    type: "DeclaredPredicate",
    value: value,
  } as t.DeclaredPredicate;
  validateNode(node);
  return node;
}
export function existsTypeAnnotation() {
  const node = {
    type: "ExistsTypeAnnotation",
  } as t.ExistsTypeAnnotation;
  validateNode(node);
  return node;
}
export function functionTypeAnnotation(
  typeParameters: t.TypeParameterDeclaration | null | undefined,
  params: Array<t.FunctionTypeParam>,
  rest: t.FunctionTypeParam | null | undefined,
  returnType: t.FlowType,
) {
  const node = {
    type: "FunctionTypeAnnotation",
    typeParameters: typeParameters,
    params: params,
    rest: rest,
    returnType: returnType,
    this: null,
  } as t.FunctionTypeAnnotation;
  validateNode(node);
  return node;
}
export function functionTypeParam(
  name: t.Identifier | null | undefined,
  typeAnnotation: t.FlowType,
) {
  const node = {
    type: "FunctionTypeParam",
    name: name,
    typeAnnotation: typeAnnotation,
    optional: null,
  } as t.FunctionTypeParam;
  validateNode(node);
  return node;
}
export function genericTypeAnnotation(
  id: t.Identifier | t.QualifiedTypeIdentifier,
  typeParameters: t.TypeParameterInstantiation | null = null,
) {
  const node = {
    type: "GenericTypeAnnotation",
    id: id,
    typeParameters: typeParameters,
  } as t.GenericTypeAnnotation;
  validateNode(node);
  return node;
}
export function inferredPredicate() {
  const node = {
    type: "InferredPredicate",
  } as t.InferredPredicate;
  validateNode(node);
  return node;
}
export function interfaceExtends(
  id: t.Identifier | t.QualifiedTypeIdentifier,
  typeParameters: t.TypeParameterInstantiation | null = null,
) {
  const node = {
    type: "InterfaceExtends",
    id: id,
    typeParameters: typeParameters,
  } as t.InterfaceExtends;
  validateNode(node);
  return node;
}
export function interfaceDeclaration(
  id: t.Identifier,
  typeParameters: t.TypeParameterDeclaration | null | undefined,
  _extends: Array<t.InterfaceExtends> | null | undefined,
  body: t.ObjectTypeAnnotation,
) {
  const node = {
    type: "InterfaceDeclaration",
    id: id,
    typeParameters: typeParameters,
    extends: _extends,
    body: body,
    implements: null,
    mixins: null,
  } as t.InterfaceDeclaration;
  validateNode(node);
  return node;
}
export function interfaceTypeAnnotation(
  _extends: Array<t.InterfaceExtends> | null | undefined,
  body: t.ObjectTypeAnnotation,
) {
  const node = {
    type: "InterfaceTypeAnnotation",
    extends: _extends,
    body: body,
  } as t.InterfaceTypeAnnotation;
  validateNode(node);
  return node;
}
export function intersectionTypeAnnotation(types: Array<t.FlowType>) {
  const node = {
    type: "IntersectionTypeAnnotation",
    types: types,
  } as t.IntersectionTypeAnnotation;
  validateNode(node);
  return node;
}
export function mixedTypeAnnotation() {
  const node = {
    type: "MixedTypeAnnotation",
  } as t.MixedTypeAnnotation;
  validateNode(node);
  return node;
}
export function emptyTypeAnnotation() {
  const node = {
    type: "EmptyTypeAnnotation",
  } as t.EmptyTypeAnnotation;
  validateNode(node);
  return node;
}
export function nullableTypeAnnotation(typeAnnotation: t.FlowType) {
  const node = {
    type: "NullableTypeAnnotation",
    typeAnnotation: typeAnnotation,
  } as t.NullableTypeAnnotation;
  validateNode(node);
  return node;
}
export function numberLiteralTypeAnnotation(value: number) {
  const node = {
    type: "NumberLiteralTypeAnnotation",
    value: value,
  } as t.NumberLiteralTypeAnnotation;
  validateNode(node);
  return node;
}
export function numberTypeAnnotation() {
  const node = {
    type: "NumberTypeAnnotation",
  } as t.NumberTypeAnnotation;
  validateNode(node);
  return node;
}
export function objectTypeAnnotation(
  properties: Array<t.ObjectTypeProperty | t.ObjectTypeSpreadProperty>,
  indexers: Array<t.ObjectTypeIndexer> | null = null,
  callProperties: Array<t.ObjectTypeCallProperty> | null = null,
  internalSlots: Array<t.ObjectTypeInternalSlot> | null = null,
  exact: boolean = false,
) {
  const node = {
    type: "ObjectTypeAnnotation",
    properties: properties,
    indexers: indexers,
    callProperties: callProperties,
    internalSlots: internalSlots,
    exact: exact,
    inexact: null,
  } as t.ObjectTypeAnnotation;
  validateNode(node);
  return node;
}
export function objectTypeInternalSlot(
  id: t.Identifier,
  value: t.FlowType,
  optional: boolean,
  _static: boolean,
  method: boolean,
) {
  const node = {
    type: "ObjectTypeInternalSlot",
    id: id,
    value: value,
    optional: optional,
    static: _static,
    method: method,
  } as t.ObjectTypeInternalSlot;
  validateNode(node);
  return node;
}
export function objectTypeCallProperty(value: t.FlowType) {
  const node = {
    type: "ObjectTypeCallProperty",
    value: value,
    static: null,
  } as t.ObjectTypeCallProperty;
  validateNode(node);
  return node;
}
export function objectTypeIndexer(
  id: t.Identifier | null | undefined,
  key: t.FlowType,
  value: t.FlowType,
  variance: t.Variance | null = null,
) {
  const node = {
    type: "ObjectTypeIndexer",
    id: id,
    key: key,
    value: value,
    variance: variance,
    static: null,
  } as t.ObjectTypeIndexer;
  validateNode(node);
  return node;
}
export function objectTypeProperty(
  key: t.Identifier | t.StringLiteral,
  value: t.FlowType,
  variance: t.Variance | null = null,
) {
  const node = {
    type: "ObjectTypeProperty",
    key: key,
    value: value,
    variance: variance,
    kind: null,
    method: null,
    optional: null,
    proto: null,
    static: null,
  } as t.ObjectTypeProperty;
  validateNode(node);
  return node;
}
export function objectTypeSpreadProperty(argument: t.FlowType) {
  const node = {
    type: "ObjectTypeSpreadProperty",
    argument: argument,
  } as t.ObjectTypeSpreadProperty;
  validateNode(node);
  return node;
}
export function opaqueType(
  id: t.Identifier,
  typeParameters: t.TypeParameterDeclaration | null | undefined,
  supertype: t.FlowType | null | undefined,
  impltype: t.FlowType,
) {
  const node = {
    type: "OpaqueType",
    id: id,
    typeParameters: typeParameters,
    supertype: supertype,
    impltype: impltype,
  } as t.OpaqueType;
  validateNode(node);
  return node;
}
export function qualifiedTypeIdentifier(
  id: t.Identifier,
  qualification: t.Identifier | t.QualifiedTypeIdentifier,
) {
  const node = {
    type: "QualifiedTypeIdentifier",
    id: id,
    qualification: qualification,
  } as t.QualifiedTypeIdentifier;
  validateNode(node);
  return node;
}
export function stringLiteralTypeAnnotation(value: string) {
  const node = {
    type: "StringLiteralTypeAnnotation",
    value: value,
  } as t.StringLiteralTypeAnnotation;
  validateNode(node);
  return node;
}
export function stringTypeAnnotation() {
  const node = {
    type: "StringTypeAnnotation",
  } as t.StringTypeAnnotation;
  validateNode(node);
  return node;
}
export function symbolTypeAnnotation() {
  const node = {
    type: "SymbolTypeAnnotation",
  } as t.SymbolTypeAnnotation;
  validateNode(node);
  return node;
}
export function thisTypeAnnotation() {
  const node = {
    type: "ThisTypeAnnotation",
  } as t.ThisTypeAnnotation;
  validateNode(node);
  return node;
}
export function tupleTypeAnnotation(types: Array<t.FlowType>) {
  const node = {
    type: "TupleTypeAnnotation",
    types: types,
  } as t.TupleTypeAnnotation;
  validateNode(node);
  return node;
}
export function typeofTypeAnnotation(argument: t.FlowType) {
  const node = {
    type: "TypeofTypeAnnotation",
    argument: argument,
  } as t.TypeofTypeAnnotation;
  validateNode(node);
  return node;
}
export function typeAlias(
  id: t.Identifier,
  typeParameters: t.TypeParameterDeclaration | null | undefined,
  right: t.FlowType,
) {
  const node = {
    type: "TypeAlias",
    id: id,
    typeParameters: typeParameters,
    right: right,
  } as t.TypeAlias;
  validateNode(node);
  return node;
}
export function typeAnnotation(typeAnnotation: t.FlowType) {
  const node = {
    type: "TypeAnnotation",
    typeAnnotation: typeAnnotation,
  } as t.TypeAnnotation;
  validateNode(node);
  return node;
}
export function typeCastExpression(
  expression: t.Expression,
  typeAnnotation: t.TypeAnnotation,
) {
  const node = {
    type: "TypeCastExpression",
    expression: expression,
    typeAnnotation: typeAnnotation,
  } as t.TypeCastExpression;
  validateNode(node);
  return node;
}
export function typeParameter(
  bound: t.TypeAnnotation | null = null,
  _default: t.FlowType | null = null,
  variance: t.Variance | null = null,
) {
  const node = {
    type: "TypeParameter",
    bound: bound,
    default: _default,
    variance: variance,
    name: null,
  } as t.TypeParameter;
  validateNode(node);
  return node;
}
export function typeParameterDeclaration(params: Array<t.TypeParameter>) {
  const node = {
    type: "TypeParameterDeclaration",
    params: params,
  } as t.TypeParameterDeclaration;
  validateNode(node);
  return node;
}
export function typeParameterInstantiation(params: Array<t.FlowType>) {
  const node = {
    type: "TypeParameterInstantiation",
    params: params,
  } as t.TypeParameterInstantiation;
  validateNode(node);
  return node;
}
export function unionTypeAnnotation(types: Array<t.FlowType>) {
  const node = {
    type: "UnionTypeAnnotation",
    types: types,
  } as t.UnionTypeAnnotation;
  validateNode(node);
  return node;
}
export function variance(kind: "minus" | "plus") {
  const node = {
    type: "Variance",
    kind: kind,
  } as t.Variance;
  validateNode(node);
  return node;
}
export function voidTypeAnnotation() {
  const node = {
    type: "VoidTypeAnnotation",
  } as t.VoidTypeAnnotation;
  validateNode(node);
  return node;
}
export function enumDeclaration(
  id: t.Identifier,
  body:
    | t.EnumBooleanBody
    | t.EnumNumberBody
    | t.EnumStringBody
    | t.EnumSymbolBody,
) {
  const node = {
    type: "EnumDeclaration",
    id: id,
    body: body,
  } as t.EnumDeclaration;
  validateNode(node);
  return node;
}
export function enumBooleanBody(members: Array<t.EnumBooleanMember>) {
  const node = {
    type: "EnumBooleanBody",
    members: members,
    explicitType: null,
    hasUnknownMembers: null,
  } as t.EnumBooleanBody;
  validateNode(node);
  return node;
}
export function enumNumberBody(members: Array<t.EnumNumberMember>) {
  const node = {
    type: "EnumNumberBody",
    members: members,
    explicitType: null,
    hasUnknownMembers: null,
  } as t.EnumNumberBody;
  validateNode(node);
  return node;
}
export function enumStringBody(
  members: Array<t.EnumStringMember | t.EnumDefaultedMember>,
) {
  const node = {
    type: "EnumStringBody",
    members: members,
    explicitType: null,
    hasUnknownMembers: null,
  } as t.EnumStringBody;
  validateNode(node);
  return node;
}
export function enumSymbolBody(members: Array<t.EnumDefaultedMember>) {
  const node = {
    type: "EnumSymbolBody",
    members: members,
    hasUnknownMembers: null,
  } as t.EnumSymbolBody;
  validateNode(node);
  return node;
}
export function enumBooleanMember(id: t.Identifier) {
  const node = {
    type: "EnumBooleanMember",
    id: id,
    init: null,
  } as t.EnumBooleanMember;
  validateNode(node);
  return node;
}
export function enumNumberMember(id: t.Identifier, init: t.NumericLiteral) {
  const node = {
    type: "EnumNumberMember",
    id: id,
    init: init,
  } as t.EnumNumberMember;
  validateNode(node);
  return node;
}
export function enumStringMember(id: t.Identifier, init: t.StringLiteral) {
  const node = {
    type: "EnumStringMember",
    id: id,
    init: init,
  } as t.EnumStringMember;
  validateNode(node);
  return node;
}
export function enumDefaultedMember(id: t.Identifier) {
  const node = {
    type: "EnumDefaultedMember",
    id: id,
  } as t.EnumDefaultedMember;
  validateNode(node);
  return node;
}
export function indexedAccessType(
  objectType: t.FlowType,
  indexType: t.FlowType,
) {
  const node = {
    type: "IndexedAccessType",
    objectType: objectType,
    indexType: indexType,
  } as t.IndexedAccessType;
  validateNode(node);
  return node;
}
export function optionalIndexedAccessType(
  objectType: t.FlowType,
  indexType: t.FlowType,
) {
  const node = {
    type: "OptionalIndexedAccessType",
    objectType: objectType,
    indexType: indexType,
    optional: null,
  } as t.OptionalIndexedAccessType;
  validateNode(node);
  return node;
}
export function jsxAttribute(
  name: t.JSXIdentifier | t.JSXNamespacedName,
  value:
    | t.JSXElement
    | t.JSXFragment
    | t.StringLiteral
    | t.JSXExpressionContainer
    | null = null,
) {
  const node = {
    type: "JSXAttribute",
    name: name,
    value: value,
  } as t.JSXAttribute;
  validateNode(node);
  return node;
}
export { jsxAttribute as jSXAttribute };
export function jsxClosingElement(
  name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName,
) {
  const node = {
    type: "JSXClosingElement",
    name: name,
  } as t.JSXClosingElement;
  validateNode(node);
  return node;
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
  selfClosing: boolean | null = null,
) {
  const node = {
    type: "JSXElement",
    openingElement: openingElement,
    closingElement: closingElement,
    children: children,
    selfClosing: selfClosing,
  } as t.JSXElement;
  validateNode(node);
  return node;
}
export { jsxElement as jSXElement };
export function jsxEmptyExpression() {
  const node = {
    type: "JSXEmptyExpression",
  } as t.JSXEmptyExpression;
  validateNode(node);
  return node;
}
export { jsxEmptyExpression as jSXEmptyExpression };
export function jsxExpressionContainer(
  expression: t.Expression | t.JSXEmptyExpression,
) {
  const node = {
    type: "JSXExpressionContainer",
    expression: expression,
  } as t.JSXExpressionContainer;
  validateNode(node);
  return node;
}
export { jsxExpressionContainer as jSXExpressionContainer };
export function jsxSpreadChild(expression: t.Expression) {
  const node = {
    type: "JSXSpreadChild",
    expression: expression,
  } as t.JSXSpreadChild;
  validateNode(node);
  return node;
}
export { jsxSpreadChild as jSXSpreadChild };
export function jsxIdentifier(name: string) {
  const node = {
    type: "JSXIdentifier",
    name: name,
  } as t.JSXIdentifier;
  validateNode(node);
  return node;
}
export { jsxIdentifier as jSXIdentifier };
export function jsxMemberExpression(
  object: t.JSXMemberExpression | t.JSXIdentifier,
  property: t.JSXIdentifier,
) {
  const node = {
    type: "JSXMemberExpression",
    object: object,
    property: property,
  } as t.JSXMemberExpression;
  validateNode(node);
  return node;
}
export { jsxMemberExpression as jSXMemberExpression };
export function jsxNamespacedName(
  namespace: t.JSXIdentifier,
  name: t.JSXIdentifier,
) {
  const node = {
    type: "JSXNamespacedName",
    namespace: namespace,
    name: name,
  } as t.JSXNamespacedName;
  validateNode(node);
  return node;
}
export { jsxNamespacedName as jSXNamespacedName };
export function jsxOpeningElement(
  name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName,
  attributes: Array<t.JSXAttribute | t.JSXSpreadAttribute>,
  selfClosing: boolean = false,
) {
  const node = {
    type: "JSXOpeningElement",
    name: name,
    attributes: attributes,
    selfClosing: selfClosing,
    typeParameters: null,
  } as t.JSXOpeningElement;
  validateNode(node);
  return node;
}
export { jsxOpeningElement as jSXOpeningElement };
export function jsxSpreadAttribute(argument: t.Expression) {
  const node = {
    type: "JSXSpreadAttribute",
    argument: argument,
  } as t.JSXSpreadAttribute;
  validateNode(node);
  return node;
}
export { jsxSpreadAttribute as jSXSpreadAttribute };
export function jsxText(value: string) {
  const node = {
    type: "JSXText",
    value: value,
  } as t.JSXText;
  validateNode(node);
  return node;
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
) {
  const node = {
    type: "JSXFragment",
    openingFragment: openingFragment,
    closingFragment: closingFragment,
    children: children,
  } as t.JSXFragment;
  validateNode(node);
  return node;
}
export { jsxFragment as jSXFragment };
export function jsxOpeningFragment() {
  const node = {
    type: "JSXOpeningFragment",
  } as t.JSXOpeningFragment;
  validateNode(node);
  return node;
}
export { jsxOpeningFragment as jSXOpeningFragment };
export function jsxClosingFragment() {
  const node = {
    type: "JSXClosingFragment",
  } as t.JSXClosingFragment;
  validateNode(node);
  return node;
}
export { jsxClosingFragment as jSXClosingFragment };
export function noop() {
  const node = {
    type: "Noop",
  } as t.Noop;
  validateNode(node);
  return node;
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
) {
  const node = {
    type: "Placeholder",
    expectedNode: expectedNode,
    name: name,
  } as t.Placeholder;
  validateNode(node);
  return node;
}
export function v8IntrinsicIdentifier(name: string) {
  const node = {
    type: "V8IntrinsicIdentifier",
    name: name,
  } as t.V8IntrinsicIdentifier;
  validateNode(node);
  return node;
}
export function argumentPlaceholder() {
  const node = {
    type: "ArgumentPlaceholder",
  } as t.ArgumentPlaceholder;
  validateNode(node);
  return node;
}
export function bindExpression(object: t.Expression, callee: t.Expression) {
  const node = {
    type: "BindExpression",
    object: object,
    callee: callee,
  } as t.BindExpression;
  validateNode(node);
  return node;
}
export function classProperty(
  key: t.Identifier | t.StringLiteral | t.NumericLiteral | t.Expression,
  value: t.Expression | null = null,
  typeAnnotation: t.TypeAnnotation | t.TSTypeAnnotation | t.Noop | null = null,
  decorators: Array<t.Decorator> | null = null,
  computed: boolean = false,
  _static: boolean = false,
) {
  const node = {
    type: "ClassProperty",
    key: key,
    value: value,
    typeAnnotation: typeAnnotation,
    decorators: decorators,
    computed: computed,
    static: _static,
    abstract: null,
    accessibility: null,
    declare: null,
    definite: null,
    optional: null,
    override: false,
    readonly: null,
  } as t.ClassProperty;
  validateNode(node);
  return node;
}
export function pipelineTopicExpression(expression: t.Expression) {
  const node = {
    type: "PipelineTopicExpression",
    expression: expression,
  } as t.PipelineTopicExpression;
  validateNode(node);
  return node;
}
export function pipelineBareFunction(callee: t.Expression) {
  const node = {
    type: "PipelineBareFunction",
    callee: callee,
  } as t.PipelineBareFunction;
  validateNode(node);
  return node;
}
export function pipelinePrimaryTopicReference() {
  const node = {
    type: "PipelinePrimaryTopicReference",
  } as t.PipelinePrimaryTopicReference;
  validateNode(node);
  return node;
}
export function classPrivateProperty(
  key: t.PrivateName,
  value: t.Expression | null | undefined,
  decorators: Array<t.Decorator> | null | undefined,
  _static: any,
) {
  const node = {
    type: "ClassPrivateProperty",
    key: key,
    value: value,
    decorators: decorators,
    static: _static,
    typeAnnotation: null,
  } as t.ClassPrivateProperty;
  validateNode(node);
  return node;
}
export function classPrivateMethod(
  kind: "get" | "set" | "method" | "constructor" | undefined,
  key: t.PrivateName,
  params: Array<
    t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty
  >,
  body: t.BlockStatement,
  _static: boolean = false,
) {
  const node = {
    type: "ClassPrivateMethod",
    kind: kind,
    key: key,
    params: params,
    body: body,
    static: _static,
    abstract: null,
    access: null,
    accessibility: null,
    async: false,
    computed: false,
    decorators: null,
    generator: false,
    optional: null,
    override: false,
    returnType: null,
    typeParameters: null,
  } as t.ClassPrivateMethod;
  validateNode(node);
  return node;
}
export function importAttribute(
  key: t.Identifier | t.StringLiteral,
  value: t.StringLiteral,
) {
  const node = {
    type: "ImportAttribute",
    key: key,
    value: value,
  } as t.ImportAttribute;
  validateNode(node);
  return node;
}
export function decorator(expression: t.Expression) {
  const node = {
    type: "Decorator",
    expression: expression,
  } as t.Decorator;
  validateNode(node);
  return node;
}
export function doExpression(body: t.BlockStatement, async: boolean = false) {
  const node = {
    type: "DoExpression",
    body: body,
    async: async,
  } as t.DoExpression;
  validateNode(node);
  return node;
}
export function exportDefaultSpecifier(exported: t.Identifier) {
  const node = {
    type: "ExportDefaultSpecifier",
    exported: exported,
  } as t.ExportDefaultSpecifier;
  validateNode(node);
  return node;
}
export function privateName(id: t.Identifier) {
  const node = {
    type: "PrivateName",
    id: id,
  } as t.PrivateName;
  validateNode(node);
  return node;
}
export function recordExpression(
  properties: Array<t.ObjectProperty | t.SpreadElement>,
) {
  const node = {
    type: "RecordExpression",
    properties: properties,
  } as t.RecordExpression;
  validateNode(node);
  return node;
}
export function tupleExpression(
  elements: Array<t.Expression | t.SpreadElement> = [],
) {
  const node = {
    type: "TupleExpression",
    elements: elements,
  } as t.TupleExpression;
  validateNode(node);
  return node;
}
export function decimalLiteral(value: string) {
  const node = {
    type: "DecimalLiteral",
    value: value,
  } as t.DecimalLiteral;
  validateNode(node);
  return node;
}
export function staticBlock(body: Array<t.Statement>) {
  const node = {
    type: "StaticBlock",
    body: body,
  } as t.StaticBlock;
  validateNode(node);
  return node;
}
export function moduleExpression(body: t.Program) {
  const node = {
    type: "ModuleExpression",
    body: body,
  } as t.ModuleExpression;
  validateNode(node);
  return node;
}
export function tsParameterProperty(
  parameter: t.Identifier | t.AssignmentPattern,
) {
  const node = {
    type: "TSParameterProperty",
    parameter: parameter,
    accessibility: null,
    readonly: null,
  } as t.TSParameterProperty;
  validateNode(node);
  return node;
}
export { tsParameterProperty as tSParameterProperty };
export function tsDeclareFunction(
  id: t.Identifier | null | undefined,
  typeParameters: t.TSTypeParameterDeclaration | t.Noop | null | undefined,
  params: Array<t.Identifier | t.Pattern | t.RestElement>,
  returnType: t.TSTypeAnnotation | t.Noop | null = null,
) {
  const node = {
    type: "TSDeclareFunction",
    id: id,
    typeParameters: typeParameters,
    params: params,
    returnType: returnType,
    async: false,
    declare: null,
    generator: false,
  } as t.TSDeclareFunction;
  validateNode(node);
  return node;
}
export { tsDeclareFunction as tSDeclareFunction };
export function tsDeclareMethod(
  decorators: Array<t.Decorator> | null | undefined,
  key: t.Identifier | t.StringLiteral | t.NumericLiteral | t.Expression,
  typeParameters: t.TSTypeParameterDeclaration | t.Noop | null | undefined,
  params: Array<
    t.Identifier | t.Pattern | t.RestElement | t.TSParameterProperty
  >,
  returnType: t.TSTypeAnnotation | t.Noop | null = null,
) {
  const node = {
    type: "TSDeclareMethod",
    decorators: decorators,
    key: key,
    typeParameters: typeParameters,
    params: params,
    returnType: returnType,
    abstract: null,
    access: null,
    accessibility: null,
    async: false,
    computed: false,
    generator: false,
    kind: "method",
    optional: null,
    override: false,
    static: false,
  } as t.TSDeclareMethod;
  validateNode(node);
  return node;
}
export { tsDeclareMethod as tSDeclareMethod };
export function tsQualifiedName(left: t.TSEntityName, right: t.Identifier) {
  const node = {
    type: "TSQualifiedName",
    left: left,
    right: right,
  } as t.TSQualifiedName;
  validateNode(node);
  return node;
}
export { tsQualifiedName as tSQualifiedName };
export function tsCallSignatureDeclaration(
  typeParameters: t.TSTypeParameterDeclaration | null | undefined,
  parameters: Array<t.Identifier | t.RestElement>,
  typeAnnotation: t.TSTypeAnnotation | null = null,
) {
  const node = {
    type: "TSCallSignatureDeclaration",
    typeParameters: typeParameters,
    parameters: parameters,
    typeAnnotation: typeAnnotation,
  } as t.TSCallSignatureDeclaration;
  validateNode(node);
  return node;
}
export { tsCallSignatureDeclaration as tSCallSignatureDeclaration };
export function tsConstructSignatureDeclaration(
  typeParameters: t.TSTypeParameterDeclaration | null | undefined,
  parameters: Array<t.Identifier | t.RestElement>,
  typeAnnotation: t.TSTypeAnnotation | null = null,
) {
  const node = {
    type: "TSConstructSignatureDeclaration",
    typeParameters: typeParameters,
    parameters: parameters,
    typeAnnotation: typeAnnotation,
  } as t.TSConstructSignatureDeclaration;
  validateNode(node);
  return node;
}
export { tsConstructSignatureDeclaration as tSConstructSignatureDeclaration };
export function tsPropertySignature(
  key: t.Expression,
  typeAnnotation: t.TSTypeAnnotation | null = null,
  initializer: t.Expression | null = null,
) {
  const node = {
    type: "TSPropertySignature",
    key: key,
    typeAnnotation: typeAnnotation,
    initializer: initializer,
    computed: null,
    optional: null,
    readonly: null,
  } as t.TSPropertySignature;
  validateNode(node);
  return node;
}
export { tsPropertySignature as tSPropertySignature };
export function tsMethodSignature(
  key: t.Expression,
  typeParameters: t.TSTypeParameterDeclaration | null | undefined,
  parameters: Array<t.Identifier | t.RestElement>,
  typeAnnotation: t.TSTypeAnnotation | null = null,
) {
  const node = {
    type: "TSMethodSignature",
    key: key,
    typeParameters: typeParameters,
    parameters: parameters,
    typeAnnotation: typeAnnotation,
    computed: null,
    kind: null,
    optional: null,
  } as t.TSMethodSignature;
  validateNode(node);
  return node;
}
export { tsMethodSignature as tSMethodSignature };
export function tsIndexSignature(
  parameters: Array<t.Identifier>,
  typeAnnotation: t.TSTypeAnnotation | null = null,
) {
  const node = {
    type: "TSIndexSignature",
    parameters: parameters,
    typeAnnotation: typeAnnotation,
    readonly: null,
    static: null,
  } as t.TSIndexSignature;
  validateNode(node);
  return node;
}
export { tsIndexSignature as tSIndexSignature };
export function tsAnyKeyword() {
  const node = {
    type: "TSAnyKeyword",
  } as t.TSAnyKeyword;
  validateNode(node);
  return node;
}
export { tsAnyKeyword as tSAnyKeyword };
export function tsBooleanKeyword() {
  const node = {
    type: "TSBooleanKeyword",
  } as t.TSBooleanKeyword;
  validateNode(node);
  return node;
}
export { tsBooleanKeyword as tSBooleanKeyword };
export function tsBigIntKeyword() {
  const node = {
    type: "TSBigIntKeyword",
  } as t.TSBigIntKeyword;
  validateNode(node);
  return node;
}
export { tsBigIntKeyword as tSBigIntKeyword };
export function tsIntrinsicKeyword() {
  const node = {
    type: "TSIntrinsicKeyword",
  } as t.TSIntrinsicKeyword;
  validateNode(node);
  return node;
}
export { tsIntrinsicKeyword as tSIntrinsicKeyword };
export function tsNeverKeyword() {
  const node = {
    type: "TSNeverKeyword",
  } as t.TSNeverKeyword;
  validateNode(node);
  return node;
}
export { tsNeverKeyword as tSNeverKeyword };
export function tsNullKeyword() {
  const node = {
    type: "TSNullKeyword",
  } as t.TSNullKeyword;
  validateNode(node);
  return node;
}
export { tsNullKeyword as tSNullKeyword };
export function tsNumberKeyword() {
  const node = {
    type: "TSNumberKeyword",
  } as t.TSNumberKeyword;
  validateNode(node);
  return node;
}
export { tsNumberKeyword as tSNumberKeyword };
export function tsObjectKeyword() {
  const node = {
    type: "TSObjectKeyword",
  } as t.TSObjectKeyword;
  validateNode(node);
  return node;
}
export { tsObjectKeyword as tSObjectKeyword };
export function tsStringKeyword() {
  const node = {
    type: "TSStringKeyword",
  } as t.TSStringKeyword;
  validateNode(node);
  return node;
}
export { tsStringKeyword as tSStringKeyword };
export function tsSymbolKeyword() {
  const node = {
    type: "TSSymbolKeyword",
  } as t.TSSymbolKeyword;
  validateNode(node);
  return node;
}
export { tsSymbolKeyword as tSSymbolKeyword };
export function tsUndefinedKeyword() {
  const node = {
    type: "TSUndefinedKeyword",
  } as t.TSUndefinedKeyword;
  validateNode(node);
  return node;
}
export { tsUndefinedKeyword as tSUndefinedKeyword };
export function tsUnknownKeyword() {
  const node = {
    type: "TSUnknownKeyword",
  } as t.TSUnknownKeyword;
  validateNode(node);
  return node;
}
export { tsUnknownKeyword as tSUnknownKeyword };
export function tsVoidKeyword() {
  const node = {
    type: "TSVoidKeyword",
  } as t.TSVoidKeyword;
  validateNode(node);
  return node;
}
export { tsVoidKeyword as tSVoidKeyword };
export function tsThisType() {
  const node = {
    type: "TSThisType",
  } as t.TSThisType;
  validateNode(node);
  return node;
}
export { tsThisType as tSThisType };
export function tsFunctionType(
  typeParameters: t.TSTypeParameterDeclaration | null | undefined,
  parameters: Array<t.Identifier | t.RestElement>,
  typeAnnotation: t.TSTypeAnnotation | null = null,
) {
  const node = {
    type: "TSFunctionType",
    typeParameters: typeParameters,
    parameters: parameters,
    typeAnnotation: typeAnnotation,
  } as t.TSFunctionType;
  validateNode(node);
  return node;
}
export { tsFunctionType as tSFunctionType };
export function tsConstructorType(
  typeParameters: t.TSTypeParameterDeclaration | null | undefined,
  parameters: Array<t.Identifier | t.RestElement>,
  typeAnnotation: t.TSTypeAnnotation | null = null,
) {
  const node = {
    type: "TSConstructorType",
    typeParameters: typeParameters,
    parameters: parameters,
    typeAnnotation: typeAnnotation,
    abstract: null,
  } as t.TSConstructorType;
  validateNode(node);
  return node;
}
export { tsConstructorType as tSConstructorType };
export function tsTypeReference(
  typeName: t.TSEntityName,
  typeParameters: t.TSTypeParameterInstantiation | null = null,
) {
  const node = {
    type: "TSTypeReference",
    typeName: typeName,
    typeParameters: typeParameters,
  } as t.TSTypeReference;
  validateNode(node);
  return node;
}
export { tsTypeReference as tSTypeReference };
export function tsTypePredicate(
  parameterName: t.Identifier | t.TSThisType,
  typeAnnotation: t.TSTypeAnnotation | null = null,
  asserts: boolean | null = null,
) {
  const node = {
    type: "TSTypePredicate",
    parameterName: parameterName,
    typeAnnotation: typeAnnotation,
    asserts: asserts,
  } as t.TSTypePredicate;
  validateNode(node);
  return node;
}
export { tsTypePredicate as tSTypePredicate };
export function tsTypeQuery(exprName: t.TSEntityName | t.TSImportType) {
  const node = {
    type: "TSTypeQuery",
    exprName: exprName,
  } as t.TSTypeQuery;
  validateNode(node);
  return node;
}
export { tsTypeQuery as tSTypeQuery };
export function tsTypeLiteral(members: Array<t.TSTypeElement>) {
  const node = {
    type: "TSTypeLiteral",
    members: members,
  } as t.TSTypeLiteral;
  validateNode(node);
  return node;
}
export { tsTypeLiteral as tSTypeLiteral };
export function tsArrayType(elementType: t.TSType) {
  const node = {
    type: "TSArrayType",
    elementType: elementType,
  } as t.TSArrayType;
  validateNode(node);
  return node;
}
export { tsArrayType as tSArrayType };
export function tsTupleType(
  elementTypes: Array<t.TSType | t.TSNamedTupleMember>,
) {
  const node = {
    type: "TSTupleType",
    elementTypes: elementTypes,
  } as t.TSTupleType;
  validateNode(node);
  return node;
}
export { tsTupleType as tSTupleType };
export function tsOptionalType(typeAnnotation: t.TSType) {
  const node = {
    type: "TSOptionalType",
    typeAnnotation: typeAnnotation,
  } as t.TSOptionalType;
  validateNode(node);
  return node;
}
export { tsOptionalType as tSOptionalType };
export function tsRestType(typeAnnotation: t.TSType) {
  const node = {
    type: "TSRestType",
    typeAnnotation: typeAnnotation,
  } as t.TSRestType;
  validateNode(node);
  return node;
}
export { tsRestType as tSRestType };
export function tsNamedTupleMember(
  label: t.Identifier,
  elementType: t.TSType,
  optional: boolean = false,
) {
  const node = {
    type: "TSNamedTupleMember",
    label: label,
    elementType: elementType,
    optional: optional,
  } as t.TSNamedTupleMember;
  validateNode(node);
  return node;
}
export { tsNamedTupleMember as tSNamedTupleMember };
export function tsUnionType(types: Array<t.TSType>) {
  const node = {
    type: "TSUnionType",
    types: types,
  } as t.TSUnionType;
  validateNode(node);
  return node;
}
export { tsUnionType as tSUnionType };
export function tsIntersectionType(types: Array<t.TSType>) {
  const node = {
    type: "TSIntersectionType",
    types: types,
  } as t.TSIntersectionType;
  validateNode(node);
  return node;
}
export { tsIntersectionType as tSIntersectionType };
export function tsConditionalType(
  checkType: t.TSType,
  extendsType: t.TSType,
  trueType: t.TSType,
  falseType: t.TSType,
) {
  const node = {
    type: "TSConditionalType",
    checkType: checkType,
    extendsType: extendsType,
    trueType: trueType,
    falseType: falseType,
  } as t.TSConditionalType;
  validateNode(node);
  return node;
}
export { tsConditionalType as tSConditionalType };
export function tsInferType(typeParameter: t.TSTypeParameter) {
  const node = {
    type: "TSInferType",
    typeParameter: typeParameter,
  } as t.TSInferType;
  validateNode(node);
  return node;
}
export { tsInferType as tSInferType };
export function tsParenthesizedType(typeAnnotation: t.TSType) {
  const node = {
    type: "TSParenthesizedType",
    typeAnnotation: typeAnnotation,
  } as t.TSParenthesizedType;
  validateNode(node);
  return node;
}
export { tsParenthesizedType as tSParenthesizedType };
export function tsTypeOperator(typeAnnotation: t.TSType) {
  const node = {
    type: "TSTypeOperator",
    typeAnnotation: typeAnnotation,
    operator: null,
  } as t.TSTypeOperator;
  validateNode(node);
  return node;
}
export { tsTypeOperator as tSTypeOperator };
export function tsIndexedAccessType(objectType: t.TSType, indexType: t.TSType) {
  const node = {
    type: "TSIndexedAccessType",
    objectType: objectType,
    indexType: indexType,
  } as t.TSIndexedAccessType;
  validateNode(node);
  return node;
}
export { tsIndexedAccessType as tSIndexedAccessType };
export function tsMappedType(
  typeParameter: t.TSTypeParameter,
  typeAnnotation: t.TSType | null = null,
  nameType: t.TSType | null = null,
) {
  const node = {
    type: "TSMappedType",
    typeParameter: typeParameter,
    typeAnnotation: typeAnnotation,
    nameType: nameType,
    optional: null,
    readonly: null,
  } as t.TSMappedType;
  validateNode(node);
  return node;
}
export { tsMappedType as tSMappedType };
export function tsLiteralType(
  literal:
    | t.NumericLiteral
    | t.StringLiteral
    | t.BooleanLiteral
    | t.BigIntLiteral,
) {
  const node = {
    type: "TSLiteralType",
    literal: literal,
  } as t.TSLiteralType;
  validateNode(node);
  return node;
}
export { tsLiteralType as tSLiteralType };
export function tsExpressionWithTypeArguments(
  expression: t.TSEntityName,
  typeParameters: t.TSTypeParameterInstantiation | null = null,
) {
  const node = {
    type: "TSExpressionWithTypeArguments",
    expression: expression,
    typeParameters: typeParameters,
  } as t.TSExpressionWithTypeArguments;
  validateNode(node);
  return node;
}
export { tsExpressionWithTypeArguments as tSExpressionWithTypeArguments };
export function tsInterfaceDeclaration(
  id: t.Identifier,
  typeParameters: t.TSTypeParameterDeclaration | null | undefined,
  _extends: Array<t.TSExpressionWithTypeArguments> | null | undefined,
  body: t.TSInterfaceBody,
) {
  const node = {
    type: "TSInterfaceDeclaration",
    id: id,
    typeParameters: typeParameters,
    extends: _extends,
    body: body,
    declare: null,
  } as t.TSInterfaceDeclaration;
  validateNode(node);
  return node;
}
export { tsInterfaceDeclaration as tSInterfaceDeclaration };
export function tsInterfaceBody(body: Array<t.TSTypeElement>) {
  const node = {
    type: "TSInterfaceBody",
    body: body,
  } as t.TSInterfaceBody;
  validateNode(node);
  return node;
}
export { tsInterfaceBody as tSInterfaceBody };
export function tsTypeAliasDeclaration(
  id: t.Identifier,
  typeParameters: t.TSTypeParameterDeclaration | null | undefined,
  typeAnnotation: t.TSType,
) {
  const node = {
    type: "TSTypeAliasDeclaration",
    id: id,
    typeParameters: typeParameters,
    typeAnnotation: typeAnnotation,
    declare: null,
  } as t.TSTypeAliasDeclaration;
  validateNode(node);
  return node;
}
export { tsTypeAliasDeclaration as tSTypeAliasDeclaration };
export function tsAsExpression(
  expression: t.Expression,
  typeAnnotation: t.TSType,
) {
  const node = {
    type: "TSAsExpression",
    expression: expression,
    typeAnnotation: typeAnnotation,
  } as t.TSAsExpression;
  validateNode(node);
  return node;
}
export { tsAsExpression as tSAsExpression };
export function tsTypeAssertion(
  typeAnnotation: t.TSType,
  expression: t.Expression,
) {
  const node = {
    type: "TSTypeAssertion",
    typeAnnotation: typeAnnotation,
    expression: expression,
  } as t.TSTypeAssertion;
  validateNode(node);
  return node;
}
export { tsTypeAssertion as tSTypeAssertion };
export function tsEnumDeclaration(
  id: t.Identifier,
  members: Array<t.TSEnumMember>,
) {
  const node = {
    type: "TSEnumDeclaration",
    id: id,
    members: members,
    const: null,
    declare: null,
    initializer: null,
  } as t.TSEnumDeclaration;
  validateNode(node);
  return node;
}
export { tsEnumDeclaration as tSEnumDeclaration };
export function tsEnumMember(
  id: t.Identifier | t.StringLiteral,
  initializer: t.Expression | null = null,
) {
  const node = {
    type: "TSEnumMember",
    id: id,
    initializer: initializer,
  } as t.TSEnumMember;
  validateNode(node);
  return node;
}
export { tsEnumMember as tSEnumMember };
export function tsModuleDeclaration(
  id: t.Identifier | t.StringLiteral,
  body: t.TSModuleBlock | t.TSModuleDeclaration,
) {
  const node = {
    type: "TSModuleDeclaration",
    id: id,
    body: body,
    declare: null,
    global: null,
  } as t.TSModuleDeclaration;
  validateNode(node);
  return node;
}
export { tsModuleDeclaration as tSModuleDeclaration };
export function tsModuleBlock(body: Array<t.Statement>) {
  const node = {
    type: "TSModuleBlock",
    body: body,
  } as t.TSModuleBlock;
  validateNode(node);
  return node;
}
export { tsModuleBlock as tSModuleBlock };
export function tsImportType(
  argument: t.StringLiteral,
  qualifier: t.TSEntityName | null = null,
  typeParameters: t.TSTypeParameterInstantiation | null = null,
) {
  const node = {
    type: "TSImportType",
    argument: argument,
    qualifier: qualifier,
    typeParameters: typeParameters,
  } as t.TSImportType;
  validateNode(node);
  return node;
}
export { tsImportType as tSImportType };
export function tsImportEqualsDeclaration(
  id: t.Identifier,
  moduleReference: t.TSEntityName | t.TSExternalModuleReference,
) {
  const node = {
    type: "TSImportEqualsDeclaration",
    id: id,
    moduleReference: moduleReference,
    isExport: null,
  } as t.TSImportEqualsDeclaration;
  validateNode(node);
  return node;
}
export { tsImportEqualsDeclaration as tSImportEqualsDeclaration };
export function tsExternalModuleReference(expression: t.StringLiteral) {
  const node = {
    type: "TSExternalModuleReference",
    expression: expression,
  } as t.TSExternalModuleReference;
  validateNode(node);
  return node;
}
export { tsExternalModuleReference as tSExternalModuleReference };
export function tsNonNullExpression(expression: t.Expression) {
  const node = {
    type: "TSNonNullExpression",
    expression: expression,
  } as t.TSNonNullExpression;
  validateNode(node);
  return node;
}
export { tsNonNullExpression as tSNonNullExpression };
export function tsExportAssignment(expression: t.Expression) {
  const node = {
    type: "TSExportAssignment",
    expression: expression,
  } as t.TSExportAssignment;
  validateNode(node);
  return node;
}
export { tsExportAssignment as tSExportAssignment };
export function tsNamespaceExportDeclaration(id: t.Identifier) {
  const node = {
    type: "TSNamespaceExportDeclaration",
    id: id,
  } as t.TSNamespaceExportDeclaration;
  validateNode(node);
  return node;
}
export { tsNamespaceExportDeclaration as tSNamespaceExportDeclaration };
export function tsTypeAnnotation(typeAnnotation: t.TSType) {
  const node = {
    type: "TSTypeAnnotation",
    typeAnnotation: typeAnnotation,
  } as t.TSTypeAnnotation;
  validateNode(node);
  return node;
}
export { tsTypeAnnotation as tSTypeAnnotation };
export function tsTypeParameterInstantiation(params: Array<t.TSType>) {
  const node = {
    type: "TSTypeParameterInstantiation",
    params: params,
  } as t.TSTypeParameterInstantiation;
  validateNode(node);
  return node;
}
export { tsTypeParameterInstantiation as tSTypeParameterInstantiation };
export function tsTypeParameterDeclaration(params: Array<t.TSTypeParameter>) {
  const node = {
    type: "TSTypeParameterDeclaration",
    params: params,
  } as t.TSTypeParameterDeclaration;
  validateNode(node);
  return node;
}
export { tsTypeParameterDeclaration as tSTypeParameterDeclaration };
export function tsTypeParameter(
  constraint: t.TSType | null | undefined,
  _default: t.TSType | null | undefined,
  name: string,
) {
  const node = {
    type: "TSTypeParameter",
    constraint: constraint,
    default: _default,
    name: name,
  } as t.TSTypeParameter;
  validateNode(node);
  return node;
}
export { tsTypeParameter as tSTypeParameter };
/** @deprecated */
function NumberLiteral(...args: Parameters<typeof numericLiteral>): any {
  console.trace(
    "The node type NumberLiteral has been renamed to NumericLiteral",
  );
  return numericLiteral(...args);
}
export { NumberLiteral as numberLiteral };
/** @deprecated */
function RegexLiteral(...args: Parameters<typeof regExpLiteral>): any {
  console.trace("The node type RegexLiteral has been renamed to RegExpLiteral");
  return regExpLiteral(...args);
}
export { RegexLiteral as regexLiteral };
/** @deprecated */
function RestProperty(...args: Parameters<typeof restElement>): any {
  console.trace("The node type RestProperty has been renamed to RestElement");
  return restElement(...args);
}
export { RestProperty as restProperty };
/** @deprecated */
function SpreadProperty(...args: Parameters<typeof spreadElement>): any {
  console.trace(
    "The node type SpreadProperty has been renamed to SpreadElement",
  );
  return spreadElement(...args);
}
export { SpreadProperty as spreadProperty };
