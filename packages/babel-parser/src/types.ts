import type { SourceType } from "./options";
import type { Token } from "./tokenizer";
import type { SourceLocation } from "./util/location";
import type { PlaceholderTypes } from "./plugins/placeholders";
import type { ParsingError } from "./parser/error";

/*
 * If making any changes to the AST, update:
 * - This repository:
 *   - This file
 *   - `ast` directory
 * - Babel repository:
 *   - packages/babel-types/src/definitions
 *   - packages/babel-generators/src/generators
 */

export interface Comment {
  type: "CommentBlock" | "CommentLine";
  value: string;
  start: number;
  end: number;
  loc: SourceLocation;
}

export interface NodeBase {
  start: number;
  end: number;
  loc: SourceLocation;
  range: [number, number];
  leadingComments?: Array<Comment>;
  trailingComments?: Array<Comment>;
  innerComments?: Array<Comment>;
  extra: {
    [key: string]: any;
  };
}

// Using a union type for `Node` makes type-checking too slow.
// Instead, add an index signature to allow a Node to be treated as anything.
// todo(flow->ts): this probably should be replaced with union
export interface Node extends NodeBase {
  type: string;
  [key: string]: any;
}
export type Expression = Node;
export type Statement = Node;
export type Pattern =
  | Identifier
  | ObjectPattern
  | ArrayPattern
  | RestElement
  | AssignmentPattern;
//| Placeholder<"Pattern">;
export type Declaration =
  | VariableDeclaration
  | ClassDeclaration
  | FunctionDeclaration
  | TsInterfaceDeclaration
  | TsTypeAliasDeclaration
  | TsEnumDeclaration
  | TsModuleDeclaration;
// | Placeholder<"Declaration">;

export interface DeclarationBase extends NodeBase {
  // TypeScript allows declarations to be prefixed by `declare`.
  //TODO: a FunctionDeclaration is never "declare", because it's a TSDeclareFunction instead.
  declare?: true;
}

// TODO: Not in spec
export interface HasDecorators extends NodeBase {
  decorators?: Array<Decorator>;
}

export interface InterpreterDirective extends NodeBase {
  type: "InterpreterDirective";
  value: string;
}

export interface Identifier extends PatternBase {
  type: "Identifier";
  name: string;
  __clone(): Identifier;
  // TypeScript only. Used in case of an optional parameter.
  optional?: true | null;
}
// | Placeholder<"Identifier">;

export interface PrivateName extends NodeBase {
  type: "PrivateName";
  id: Identifier;
}

// Literals

export type Literal =
  | RegExpLiteral
  | NullLiteral
  | StringLiteral
  | BooleanLiteral
  | NumericLiteral
  | BigIntLiteral
  | DecimalLiteral;

export interface RegExpLiteral extends NodeBase {
  type: "RegExpLiteral";
  pattern: string;
  flags: string;
}

export interface NullLiteral extends NodeBase {
  type: "NullLiteral";
}

export interface StringLiteral extends NodeBase {
  type: "StringLiteral";
  value: string;
}

export interface BooleanLiteral extends NodeBase {
  type: "BooleanLiteral";
  value: boolean;
}

export interface NumericLiteral extends NodeBase {
  type: "NumericLiteral";
  value: number;
}

export interface BigIntLiteral extends NodeBase {
  type: "BigIntLiteral";
  value: number;
}

export type DecimalLiteral = NodeBase & {
  type: "DecimalLiteral";
  value: number;
};

export type ParserOutput = {
  comments: Array<Comment>;
  errors: Array<ParsingError>;
  tokens?: Array<Token | Comment>;
};
// Programs

export type BlockStatementLike = Program | BlockStatement;

export interface File extends NodeBase, ParserOutput {
  type: "File";
  program: Program;
}

export interface Program extends NodeBase {
  type: "Program";
  sourceType: SourceType;
  body: Array<Statement | ModuleDeclaration>; // TODO: $ReadOnlyArray,
  directives: Array<Directive>; // TODO: Not in spec,
  interpreter: InterpreterDirective | null;
}

// Functions

export type Function =
  | NormalFunction
  | ArrowFunctionExpression
  | ObjectMethod
  | ClassMethod;

export type NormalFunction = FunctionDeclaration | FunctionExpression;

interface BodilessFunctionOrMethodBase extends HasDecorators {
  // TODO: Remove this. Should not assign "id" to methods.
  // https://github.com/babel/babylon/issues/535
  id: Identifier | undefined | null;
  params: Array<Pattern | TSParameterProperty>;
  generator: boolean;
  async: boolean;
  // TODO: All not in spec
  expression: boolean;
  typeParameters?: TypeParameterDeclarationBase | null;
  returnType?: TypeAnnotationBase | null;
}

export interface FunctionBase extends BodilessFunctionOrMethodBase {
  body: BlockStatement;
}

// Statements

export interface ExpressionStatement extends NodeBase {
  type: "ExpressionStatement";
  expression: Expression;
}

export interface BlockStatement extends NodeBase {
  type: "BlockStatement";
  body: Array<Statement>; // TODO: $ReadOnlyArray,
  directives: Array<Directive>;
}
// | Placeholder<"BlockStatement">;

export interface EmptyStatement extends NodeBase {
  type: "EmptyStatement";
}

export interface DebuggerStatement extends NodeBase {
  type: "DebuggerStatement";
}

export interface WithStatement extends NodeBase {
  type: "WithStatement";
  object: Expression;
  body: Statement;
}

export interface ReturnStatement extends NodeBase {
  type: "ReturnStatement";
  argument: Expression | undefined | null;
}

export interface LabeledStatement extends NodeBase {
  type: "LabeledStatement";
  label: Identifier;
  body: Statement;
}

export interface BreakStatement extends NodeBase {
  type: "BreakStatement";
  label: Identifier | undefined | null;
}

export interface ContinueStatement extends NodeBase {
  type: "ContinueStatement";
  label: Identifier | undefined | null;
}

// Choice

export interface IfStatement extends NodeBase {
  type: "IfStatement";
  test: Expression;
  consequent: Statement;
  alternate: Statement | undefined | null;
}

export interface SwitchStatement extends NodeBase {
  type: "SwitchStatement";
  discriminant: Expression;
  cases: Array<SwitchCase>;
}

export interface SwitchCase extends NodeBase {
  type: "SwitchCase";
  test: Expression | undefined | null;
  consequent: Array<Statement>;
}

// Exceptions

export interface ThrowStatement extends NodeBase {
  type: "ThrowStatement";
  argument: Expression;
}

export interface TryStatement extends NodeBase {
  type: "TryStatement";
  block: BlockStatement;
  handler: CatchClause | null;
  finalizer: BlockStatement | null;
}

export interface CatchClause extends NodeBase {
  type: "CatchClause";
  param: Pattern;
  body: BlockStatement;
}

// Loops

export interface WhileStatement extends NodeBase {
  type: "WhileStatement";
  test: Expression;
  body: Statement;
}

export interface DoWhileStatement extends NodeBase {
  type: "DoWhileStatement";
  body: Statement;
  test: Expression;
}

export type ForLike = ForStatement | ForInOf;

export interface ForStatement extends NodeBase {
  type: "ForStatement";
  init: VariableDeclaration | Expression | undefined | null;
  test: Expression | undefined | null;
  update: Expression | undefined | null;
  body: Statement;
}

export type ForInOf = ForInStatement | ForOfStatement;

interface ForInOfBase extends NodeBase {
  left: VariableDeclaration | Expression;
  right: Expression;
  body: Statement;
}

export interface ForInStatement extends ForInOfBase {
  type: "ForInStatement";
  // TODO: Shouldn't be here, but have to declare it because it's assigned to a ForInOf unconditionally.
  await: boolean;
}

export interface ForOfStatement extends ForInOfBase {
  type: "ForOfStatement";
  await: boolean;
}

// Declarations

export interface OptFunctionDeclaration extends FunctionBase, DeclarationBase {
  type: "FunctionDeclaration";
}

export interface FunctionDeclaration extends OptFunctionDeclaration {
  id: Identifier;
}

export interface VariableDeclaration extends DeclarationBase, HasDecorators {
  type: "VariableDeclaration";
  declarations: Array<VariableDeclarator>;
  kind: "var" | "let" | "const";
}

export interface VariableDeclarator extends NodeBase {
  type: "VariableDeclarator";
  id: Pattern;
  init: Expression | undefined | null;
  // TypeScript only:
  definite?: true;
}

// Misc

export interface ArgumentPlaceholder extends NodeBase {
  type: "ArgumentPlaceholder";
}

export interface Decorator extends NodeBase {
  type: "Decorator";
  expression: Expression;
  arguments?: Array<Expression | SpreadElement>;
}

export interface Directive extends NodeBase {
  type: "Directive";
  value: DirectiveLiteral;
}

export interface DirectiveLiteral extends NodeBase {
  type: "DirectiveLiteral";
  value: string;
}

export type ImportAttribute = NodeBase & {
  type: "ImportAttribute";
  key: Identifier | StringLiteral;
  value: StringLiteral;
};

// Expressions

export interface Super extends NodeBase {
  type: "Super";
}

export interface Import extends NodeBase {
  type: "Import";
}

export interface ThisExpression extends NodeBase {
  type: "ThisExpression";
}

export interface ArrowFunctionExpression extends BodilessFunctionOrMethodBase {
  type: "ArrowFunctionExpression";
  body: BlockStatement | Expression;
}

export interface YieldExpression extends NodeBase {
  type: "YieldExpression";
  argument: Expression | undefined | null;
  delegate: boolean;
}

export interface AwaitExpression extends NodeBase {
  type: "AwaitExpression";
  argument: Expression;
}

export interface ArrayExpression extends NodeBase {
  type: "ArrayExpression";
  elements: Array<Expression | SpreadElement | undefined | null>;
}

export interface DoExpression extends NodeBase {
  type: "DoExpression";
  body: BlockStatement | undefined | null;
  async: boolean;
}

export interface TupleExpression extends NodeBase {
  type: "TupleExpression";
  elements: Array<Expression | SpreadElement | undefined | null>;
}

export interface ObjectExpression extends NodeBase {
  type: "ObjectExpression";
  properties: Array<ObjectProperty | ObjectMethod | SpreadElement>;
}
export interface RecordExpression extends NodeBase {
  type: "RecordExpression";
  properties: Array<ObjectProperty | ObjectMethod | SpreadElement>;
}

export type ObjectOrClassMember = ClassMethod | ClassProperty | ObjectMember;

export type ObjectMember = ObjectProperty | ObjectMethod;

export interface ObjectMemberBase extends NodeBase {
  key: Expression;
  computed: boolean;
  value: Expression | Pattern;
  decorators?: Array<Decorator>;
  kind?: "get" | "set" | "method";
  method: boolean; // TODO: Not in spec,
  typeParameters?: TypeParameterDeclarationBase | null; // TODO: Not in spec,
  variance?: FlowVariance | null; // TODO: Not in spec
}

export interface ObjectProperty extends ObjectMemberBase {
  type: "ObjectProperty";
  shorthand: boolean;
  value: Expression | Pattern;
}

export interface ObjectMethod extends ObjectMemberBase, FunctionBase {
  type: "ObjectMethod";
  kind: "get" | "set" | "method"; // Never "constructor"
  value: Expression;
}

export interface FunctionExpression extends FunctionBase {
  kind?: void; // never set,
  type: "FunctionExpression";
}

// Unary operations

export interface UnaryExpression extends NodeBase {
  type: "UnaryExpression";
  operator: UnaryOperator;
  prefix: boolean;
  argument: Expression;
}

export type UnaryOperator =
  | "-"
  | "+"
  | "!"
  | "~"
  | "typeof"
  | "void"
  | "delete"
  | "throw";

export interface UpdateExpression extends NodeBase {
  type: "UpdateExpression";
  operator: UpdateOperator;
  argument: Expression;
  prefix: boolean;
}

export type UpdateOperator = "++" | "--";

// Binary operations

export interface BinaryExpression extends NodeBase {
  type: "BinaryExpression";
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

export type BinaryOperator =
  | "=="
  | "!="
  | "==="
  | "!=="
  | "<"
  | "<="
  | ">"
  | ">="
  | "<<"
  | ">>"
  | ">>>"
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "|"
  | "^"
  | "&"
  | "in"
  | "instanceof";

export interface AssignmentExpression extends NodeBase {
  type: "AssignmentExpression";
  operator: AssignmentOperator;
  left: Pattern | Expression;
  right: Expression;
}

export type AssignmentOperator =
  | "="
  | "+="
  | "-="
  | "*="
  | "/="
  | "%="
  | "<<="
  | ">>="
  | ">>>="
  | "|="
  | "^="
  | "&=";

export interface LogicalExpression extends NodeBase {
  type: "LogicalExpression";
  operator: LogicalOperator;
  left: Expression;
  right: Expression;
}

export type LogicalOperator = "||" | "&&";

export interface SpreadElement extends NodeBase {
  type: "SpreadElement";
  argument: Expression;
}

export interface MemberExpression extends NodeBase {
  type: "MemberExpression";
  object: Expression | Super;
  property: Expression;
  computed: boolean;
}

export interface OptionalMemberExpression extends NodeBase {
  type: "OptionalMemberExpression";
  object: Expression | Super;
  property: Expression;
  computed: boolean;
  optional: boolean;
}

export interface OptionalCallExpression extends CallOrNewBase {
  type: "OptionalCallExpression";
  optional: boolean;
}
export interface BindExpression extends NodeBase {
  type: "BindExpression";
  object: Array<Expression | undefined | null>;
  callee: Array<Expression>;
}

export interface ConditionalExpression extends NodeBase {
  type: "ConditionalExpression";
  test: Expression;
  alternate: Expression;
  consequent: Expression;
}

export interface CallOrNewBase extends NodeBase {
  callee: Expression | Super | Import;
  arguments: Array<Expression | SpreadElement>; // TODO: $ReadOnlyArray,
  typeArguments: TypeParameterInstantiationBase | undefined | null;
  typeParameters?: TypeParameterInstantiationBase | null; // TODO: Not in spec
}

export interface CallExpression extends CallOrNewBase {
  type: "CallExpression";
}

export interface NewExpression extends CallOrNewBase {
  type: "NewExpression";
  optional?: boolean; // TODO: Not in spec
}

export interface SequenceExpression extends NodeBase {
  type: "SequenceExpression";
  expressions: Array<Expression>;
}

export interface ParenthesizedExpression extends NodeBase {
  type: "ParenthesizedExpression";
  expression: Expression;
}

// Pipelines

export interface PipelineBody extends NodeBase {
  type: "PipelineBody";
}

export interface PipelineBareFunctionBody extends NodeBase {
  type: "PipelineBareFunctionBody";
  callee: Expression;
}

export interface PipelineBareConstructorBody extends NodeBase {
  type: "PipelineBareConstructorBody";
  callee: Expression;
}

export interface PipelineBareAwaitedFunctionBody extends NodeBase {
  type: "PipelineBareAwaitedFunctionBody";
  callee: Expression;
}

export interface PipelineTopicBody extends NodeBase {
  type: "PipelineTopicBody";
  expression: Expression;
}

export type PipelineStyle =
  | "PipelineBareFunction"
  | "PipelineBareConstructor"
  | "PipelineBareAwaitedFunction"
  | "PipelineTopicExpression";

// Template Literals

export interface TemplateLiteral extends NodeBase {
  type: "TemplateLiteral";
  quasis: Array<TemplateElement>;
  expressions: Array<Expression>;
}

export interface TaggedTemplateExpression extends NodeBase {
  type: "TaggedTemplateExpression";
  tag: Expression;
  quasi: TemplateLiteral;
  typeParameters?: TypeParameterInstantiationBase | null; // TODO: Not in spec
}

export interface TemplateElement extends NodeBase {
  type: "TemplateElement";
  tail: boolean;
  value: {
    cooked: string;
    raw: string;
  };
}

export type ModuleExpression = NodeBase & {
  type: "ModuleExpression";
  body: Program;
};

// Patterns

// TypeScript access modifiers
export type Accessibility = "public" | "protected" | "private";

export interface PatternBase extends HasDecorators {
  // TODO: All not in spec
  // Flow/TypeScript only:
  typeAnnotation?: TypeAnnotationBase | null;
}

export interface AssignmentProperty extends ObjectProperty {
  value: Pattern;
}

export interface ObjectPattern extends PatternBase {
  type: "ObjectPattern";
  properties: Array<AssignmentProperty | RestElement>;
}

export interface ArrayPattern extends PatternBase {
  type: "ArrayPattern";
  elements: Array<Pattern | undefined | null>;
}

export interface RestElement extends PatternBase {
  type: "RestElement";
  argument: Pattern;
}

export interface AssignmentPattern extends PatternBase {
  type: "AssignmentPattern";
  left: Pattern;
  right: Expression;
}

// Classes

export type Class = ClassDeclaration | ClassExpression;

export interface ClassBase extends HasDecorators {
  id: Identifier | undefined | null;
  superClass: Expression | undefined | null;
  body: ClassBody;
  decorators?: Array<Decorator>;
  // TODO: All not in spec
  typeParameters?: TypeParameterDeclarationBase | null;
  superTypeParameters?: TypeParameterInstantiationBase | null;
  implements?:
    | Array<TsExpressionWithTypeArguments>
    | undefined
    | null
    | Array<FlowClassImplements>;
}

export interface ClassBody extends NodeBase {
  type: "ClassBody";
  body: Array<ClassMember | StaticBlock | TsIndexSignature>; // TODO: $ReadOnlyArray
}
// | Placeholder<"ClassBody">;

export interface ClassMemberBase extends NodeBase, HasDecorators {
  static: boolean;
  computed: boolean;
  // TypeScript only:
  accessibility?: Accessibility | null;
  override?: true | null;
  abstract?: true | null;
  optional?: true | null;
}

export type StaticBlock = NodeBase & {
  type: "StaticBlock";
  body: Array<Statement>;
};

export type ClassMember =
  | ClassMethod
  | ClassPrivateMethod
  | ClassProperty
  | ClassPrivateProperty;

export type MethodLike =
  | ObjectMethod
  | FunctionExpression
  | ClassMethod
  | ClassPrivateMethod
  | TSDeclareMethod;

interface MethodBase extends FunctionBase {
  kind: MethodKind;
}

export type MethodKind = "constructor" | "method" | "get" | "set";

export interface ClassMethodOrDeclareMethodCommon extends ClassMemberBase {
  key: Expression;
  kind: MethodKind;
  static: boolean;
  decorators?: Array<Decorator>;
}

export interface ClassMethod
  extends MethodBase,
    ClassMethodOrDeclareMethodCommon {
  type: "ClassMethod";
  variance?: FlowVariance | null; // TODO: Not in spec
}

export interface ClassPrivateMethod
  extends NodeBase,
    ClassMethodOrDeclareMethodCommon,
    MethodBase {
  type: "ClassPrivateMethod";
  key: PrivateName;
  computed: false;
}

export interface ClassProperty extends ClassMemberBase, DeclarationBase {
  type: "ClassProperty";
  key: Expression;
  value: Expression | undefined | null; // TODO: Not in spec that this is nullable.,
  typeAnnotation?: TypeAnnotationBase | null; // TODO: Not in spec,
  variance?: FlowVariance | null; // TODO: Not in spec,
  // TypeScript only: (TODO: Not in spec)
  readonly?: true;
  definite?: true;
}

export interface ClassPrivateProperty extends NodeBase {
  type: "ClassPrivateProperty";
  key: PrivateName;
  value: Expression | undefined | null; // TODO: Not in spec that this is nullable.,
  static: boolean;
  computed: false;
  // Flow and Typescript
  typeAnnotation?: TypeAnnotationBase | null;
  // TypeScript only
  optional?: true;
  definite?: true;
  readonly?: true;
  override?: true;
}

export interface OptClassDeclaration
  extends ClassBase,
    DeclarationBase,
    HasDecorators {
  type: "ClassDeclaration";
  // TypeScript only
  abstract?: true | null;
}

export interface ClassDeclaration extends OptClassDeclaration {
  id: Identifier;
}

export interface ClassExpression extends ClassBase {
  type: "ClassExpression";
}

export interface MetaProperty extends NodeBase {
  type: "MetaProperty";
  meta: Identifier;
  property: Identifier;
}

// Modules

export type ModuleDeclaration = AnyImport | AnyExport;

export type AnyImport = ImportDeclaration | TsImportEqualsDeclaration;

export type AnyExport =
  | ExportNamedDeclaration
  | ExportDefaultDeclaration
  | ExportAllDeclaration
  | TsExportAssignment
  | TsImportEqualsDeclaration
  | TsNamespaceExportDeclaration;

interface ModuleSpecifier extends NodeBase {
  local: Identifier;
}

// Imports

export interface ImportDeclaration extends NodeBase {
  type: "ImportDeclaration";
  // TODO: $ReadOnlyArray
  specifiers: Array<
    ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier
  >;
  source: Literal;
  importKind?: "type" | "typeof" | "value"; // TODO: Not in spec
}

export interface ImportSpecifier extends ModuleSpecifier {
  type: "ImportSpecifier";
  imported: Identifier | StringLiteral;
}

export interface ImportDefaultSpecifier extends ModuleSpecifier {
  type: "ImportDefaultSpecifier";
}

export interface ImportNamespaceSpecifier extends ModuleSpecifier {
  type: "ImportNamespaceSpecifier";
}

// Exports

export interface ExportNamedDeclaration extends NodeBase {
  type: "ExportNamedDeclaration";
  declaration: Declaration | undefined | null;
  specifiers: Array<ExportSpecifier | ExportDefaultSpecifier>;
  source: Literal | undefined | null;
  exportKind?: "type" | "value"; // TODO: Not in spec,
  assertions?: Array<ImportAttribute>;
}

export interface ExportSpecifier extends NodeBase {
  type: "ExportSpecifier";
  exported: Identifier | StringLiteral;
  local: Identifier;
}

export interface ExportDefaultSpecifier extends NodeBase {
  type: "ExportDefaultSpecifier";
  exported: Identifier;
}

export interface ExportDefaultDeclaration extends NodeBase {
  type: "ExportDefaultDeclaration";
  declaration:
    | OptFunctionDeclaration
    | OptTSDeclareFunction
    | OptClassDeclaration
    | Expression;
}

export interface ExportAllDeclaration extends NodeBase {
  type: "ExportAllDeclaration";
  source: Literal;
  exportKind?: "type" | "value"; // TODO: Not in spec
}

// JSX (TODO: Not in spec)

export type JSXIdentifier = Node;
export type JSXNamespacedName = Node;
export type JSXMemberExpression = Node;
export type JSXEmptyExpression = Node;
export type JSXSpreadChild = Node;
export type JSXExpressionContainer = Node;
export type JSXAttribute = Node;
export interface JSXOpeningElement extends NodeBase {
  type: "JSXOpeningElement";
  name: JSXNamespacedName | JSXMemberExpression;
  typeParameters?: TypeParameterInstantiationBase | null; // TODO: Not in spec,
  attributes: Array<JSXAttribute>;
  selfClosing: boolean;
}
export type JSXClosingElement = Node;
export type JSXElement = Node;
export type JSXOpeningFragment = Node;
export type JSXClosingFragment = Node;
export type JSXFragment = Node;

// Flow/TypeScript common (TODO: Not in spec)

export interface TypeAnnotationBase extends NodeBase {
  typeAnnotation: Node;
}

export interface TypeAnnotation extends NodeBase {
  type: "TypeAnnotation";
  typeAnnotation: FlowTypeAnnotation;
}

export interface TsTypeAnnotation extends NodeBase {
  type: "TSTypeAnnotation";
  typeAnnotation: TsType;
}

export interface TypeParameterDeclarationBase extends NodeBase {
  params: Array<TypeParameterBase>;
}

export interface TypeParameterDeclaration extends TypeParameterDeclarationBase {
  type: "TypeParameterDeclaration";
  params: Array<TypeParameter>;
}

export interface TsTypeParameterDeclaration
  extends TypeParameterDeclarationBase {
  type: "TsTypeParameterDeclaration";
  params: Array<TsTypeParameter>;
}

export interface TypeParameterBase extends NodeBase {
  name: string;
}

export interface TypeParameter extends TypeParameterBase {
  type: "TypeParameter";
  default?: TypeAnnotation;
}

export interface TsTypeParameter extends TypeParameterBase {
  type: "TSTypeParameter";
  constraint?: TsType;
  default?: TsType;
}

export interface TypeParameterInstantiationBase extends NodeBase {
  params: Array<Node>;
}

export interface TypeParameterInstantiation
  extends TypeParameterInstantiationBase {
  type: "TypeParameterInstantiation";
  params: Array<FlowType>;
}

export interface TsTypeParameterInstantiation
  extends TypeParameterInstantiationBase {
  type: "TSTypeParameterInstantiation";
  params: Array<TsType>;
}

// Flow (TODO: Not in spec)

export interface TypeCastExpressionBase extends NodeBase {
  expression: Expression;
  typeAnnotation: TypeAnnotationBase;
}

export interface TypeCastExpression extends NodeBase {
  type: "TypeCastExpression";
  expression: Expression;
  typeAnnotation: TypeAnnotation;
}

export interface TsTypeCastExpression extends NodeBase {
  type: "TSTypeCastExpression";
  expression: Expression;
  typeAnnotation: TsTypeAnnotation;
}

export type FlowType = Node;
export type FlowPredicate = Node;
export type FlowDeclare = Node;
export type FlowDeclareClass = Node;
export type FlowDeclareExportDeclaration = Node;
export type FlowDeclareFunction = Node;
export type FlowDeclareVariable = Node;
export type FlowDeclareModule = Node;
export type FlowDeclareModuleExports = Node;
export type FlowDeclareTypeAlias = Node;
export type FlowDeclareOpaqueType = Node;
export type FlowDeclareInterface = Node;
export type FlowInterface = Node;
export type FlowInterfaceExtends = Node;
export type FlowTypeAlias = Node;
export type FlowOpaqueType = Node;
export type FlowObjectTypeIndexer = Node;
export type FlowObjectTypeInternalSlot = Node;
export type FlowFunctionTypeAnnotation = Node;
export type FlowObjectTypeProperty = Node;
export type FlowObjectTypeSpreadProperty = Node;
export type FlowObjectTypeCallProperty = Node;
export type FlowObjectTypeAnnotation = Node;
export type FlowQualifiedTypeIdentifier = Node;
export type FlowGenericTypeAnnotation = Node;
export type FlowTypeofTypeAnnotation = Node;
export type FlowTupleTypeAnnotation = Node;
export type FlowFunctionTypeParam = Node;
export type FlowTypeAnnotation = Node;
export type FlowVariance = Node;
export type FlowClassImplements = Node;

export interface FlowInterfaceType extends NodeBase {
  type: "FlowInterfaceType";
  extends: FlowInterfaceExtends;
  body: FlowObjectTypeAnnotation;
}

export interface FlowIndexedAccessType extends NodeBase {
  type: "IndexedAccessType";
  objectType: FlowType;
  indexType: FlowType;
}

export interface FlowOptionalIndexedAccessType extends NodeBase {
  type: "OptionalIndexedAccessType";
  objectType: FlowType;
  indexType: FlowType;
  optional: boolean;
}

export interface StringLiteralTypeAnnotation extends NodeBase {
  type: "StringLiteralTypeAnnotation";
  value: string;
}

export interface BooleanLiteralTypeAnnotation extends NodeBase {
  type: "BooleanLiteralTypeAnnotation";
  value: boolean;
}
export interface NumberLiteralTypeAnnotation extends NodeBase {
  type: "NumberLiteralTypeAnnotation";
  value: number;
}

export interface BigIntLiteralTypeAnnotation extends NodeBase {
  type: "BigIntLiteralTypeAnnotation";
  //todo(flow): use bigint when Flow supports BigInt
  value: number;
}

// ESTree
export interface EstreeLiteral extends NodeBase {
  type: "Literal";
  value: any;
}

interface EstreeRegExpLiteralRegex {
  pattern: string;
  flags: string;
}

export interface EstreeRegExpLiteral extends EstreeLiteral {
  regex: EstreeRegExpLiteralRegex;
}

export interface EstreeBigIntLiteral extends EstreeLiteral {
  value: number | null;
  bigint: string;
}

export interface EstreeProperty extends NodeBase {
  type: "Property";
  shorthand: boolean;
  key: Expression;
  computed: boolean;
  value: Expression;
  decorators: Array<Decorator>;
  kind?: "get" | "set" | "init";
  variance?: FlowVariance | null;
}

export interface EstreeMethodDefinition extends NodeBase {
  type: "MethodDefinition";
  static: boolean;
  key: Expression;
  computed: boolean;
  value: Expression;
  decorators: Array<Decorator>;
  kind?: "get" | "set" | "method";
  variance?: FlowVariance | null;
}

export interface EstreeImportExpression extends NodeBase {
  type: "ImportExpression";
  source: Expression;
  attributes?: Expression | null;
}

export interface EstreePrivateIdentifier extends NodeBase {
  type: "PrivateIdentifier";
  name: string;
}

export interface EstreePropertyDefinition extends NodeBase {
  type: "PropertyDefinition";
  static: boolean;
  key: Expression | EstreePrivateIdentifier;
  computed: boolean;
  value: Expression;
}

// === === === ===
// TypeScript
// === === === ===

// Note: A type named `TsFoo` is based on TypeScript's `FooNode` type,
// defined in https://github.com/Microsoft/TypeScript/blob/master/src/compiler/types.ts
// Differences:
// * Change `NodeArray<T>` to just `$ReadOnlyArray<T>`.
// * Don't give nodes a "modifiers" list; use boolean flags instead,
//   and only allow modifiers that are not considered errors.
// * A property named `type` must be renamed to `typeAnnotation` to avoid conflict with the node's type.
// * Sometimes TypeScript allows to parse something which will be a grammar error later;
//   in @babel/parser these cause exceptions, so the AST format is stricter.

// ================
// Misc
// ================

export interface TSParameterProperty extends HasDecorators {
  // Note: This has decorators instead of its parameter.
  type: "TSParameterProperty";
  // At least one of `accessibility` or `readonly` must be set.
  accessibility?: Accessibility | null;
  readonly?: true | null;
  parameter: Identifier | AssignmentPattern;
}

export interface OptTSDeclareFunction extends FunctionBase, DeclarationBase {
  type: "TSDeclareFunction";
}

export interface TSDeclareFunction extends OptTSDeclareFunction {
  id: Identifier;
}

export interface TSDeclareMethod
  extends FunctionBase,
    ClassMethodOrDeclareMethodCommon {
  type: "TSDeclareMethod";
  kind: MethodKind;
}

export interface TsQualifiedName extends NodeBase {
  type: "TSQualifiedName";
  left: TsEntityName;
  right: Identifier;
}

export type TsEntityName = Identifier | TsQualifiedName;

export type TsSignatureDeclaration =
  | TsCallSignatureDeclaration
  | TsConstructSignatureDeclaration
  | TsMethodSignature
  | TsFunctionType
  | TsConstructorType;

export interface TsSignatureDeclarationOrIndexSignatureBase extends NodeBase {
  // Not using TypeScript's "ParameterDeclaration" here, since it's inconsistent with regular functions.
  parameters: Array<Identifier | RestElement | ObjectPattern | ArrayPattern>;
  typeAnnotation: TsTypeAnnotation | undefined | null;
}

export interface TsSignatureDeclarationBase
  extends TsSignatureDeclarationOrIndexSignatureBase {
  typeParameters: TsTypeParameterDeclaration | undefined | null;
}

// ================
// TypeScript type members (for type literal / interface / class)
// ================

export type TsTypeElement =
  | TsCallSignatureDeclaration
  | TsConstructSignatureDeclaration
  | TsPropertySignature
  | TsMethodSignature
  | TsIndexSignature;

export interface TsCallSignatureDeclaration extends TsSignatureDeclarationBase {
  type: "TSCallSignatureDeclaration";
}

export interface TsConstructSignatureDeclaration
  extends TsSignatureDeclarationBase {
  type: "TSConstructSignature";
}

export interface TsNamedTypeElementBase extends NodeBase {
  // Not using TypeScript's `PropertyName` here since we don't have a `ComputedPropertyName` node type.
  // This is usually an Identifier but may be e.g. `Symbol.iterator` if `computed` is true.
  key: Expression;
  computed: boolean;
  optional?: true;
}

export interface TsPropertySignature extends TsNamedTypeElementBase {
  type: "TSPropertySignature";
  readonly?: true;
  typeAnnotation?: TsTypeAnnotation;
  initializer?: Expression;
}

export interface TsMethodSignature
  extends TsSignatureDeclarationBase,
    TsNamedTypeElementBase {
  type: "TSMethodSignature";
  kind: "method" | "get" | "set";
}

// *Not* a ClassMemberBase: Can't have accessibility, can't be abstract, can't be optional.
export interface TsIndexSignature
  extends TsSignatureDeclarationOrIndexSignatureBase {
  readonly?: true;
  static?: true;
  type: "TSIndexSignature";
  // Note: parameters.length must be 1.
}

// ================
// TypeScript types
// ================

export type TsType =
  | TsKeywordType
  | TsThisType
  | TsFunctionOrConstructorType
  | TsTypeReference
  | TsTypeQuery
  | TsTypeLiteral
  | TsArrayType
  | TsTupleType
  | TsOptionalType
  | TsRestType
  | TsUnionOrIntersectionType
  | TsConditionalType
  | TsInferType
  | TsParenthesizedType
  | TsTypeOperator
  | TsIndexedAccessType
  | TsMappedType
  | TsLiteralType // TODO: This probably shouldn't be included here.
  | TsImportType
  | TsTypePredicate;

export type TsTypeBase = NodeBase;

export type TsKeywordTypeType =
  | "TSAnyKeyword"
  | "TSUnknownKeyword"
  | "TSNumberKeyword"
  | "TSObjectKeyword"
  | "TSBooleanKeyword"
  | "TSBigIntKeyword"
  | "TSStringKeyword"
  | "TSSymbolKeyword"
  | "TSVoidKeyword"
  | "TSUndefinedKeyword"
  | "TSNullKeyword"
  | "TSNeverKeyword"
  | "TSIntrinsicKeyword";
export interface TsKeywordType extends TsTypeBase {
  type: TsKeywordTypeType;
}

export interface TsThisType extends TsTypeBase {
  type: "TSThisType";
}

export type TsFunctionOrConstructorType = TsFunctionType | TsConstructorType;

export interface TsFunctionType extends TsTypeBase, TsSignatureDeclarationBase {
  type: "TSFunctionType";
  typeAnnotation: TsTypeAnnotation; // not optional
}

export interface TsConstructorType
  extends TsTypeBase,
    TsSignatureDeclarationBase {
  type: "TSConstructorType";
  typeAnnotation: TsTypeAnnotation;
  abstract: boolean;
}

export interface TsTypeReference extends TsTypeBase {
  type: "TSTypeReference";
  typeName: TsEntityName;
  typeParameters?: TsTypeParameterInstantiation;
}

export interface TsTypePredicate extends TsTypeBase {
  type: "TSTypePredicate";
  parameterName: Identifier | TsThisType;
  typeAnnotation: TsTypeAnnotation | null;
  asserts: boolean;
}

// `typeof` operator
export interface TsTypeQuery extends TsTypeBase {
  type: "TSTypeQuery";
  exprName: TsEntityName | TsImportType;
}

export interface TsTypeLiteral extends TsTypeBase {
  type: "TSTypeLiteral";
  members: Array<TsTypeElement>;
}

export interface TsArrayType extends TsTypeBase {
  type: "TSArrayType";
  elementType: TsType;
}

export interface TsTupleType extends TsTypeBase {
  type: "TSTupleType";
  elementTypes: Array<TsType | TsNamedTupleMember>;
}

export interface TsNamedTupleMember extends TsTypeBase {
  type: "TSNamedTupleMember";
  label: Identifier;
  optional: boolean;
  elementType: TsType;
}

export interface TsOptionalType extends TsTypeBase {
  type: "TSOptionalType";
  typeAnnotation: TsType;
}

export interface TsRestType extends TsTypeBase {
  type: "TSRestType";
  typeAnnotation: TsType | TsNamedTupleMember;
}

export type TsUnionOrIntersectionType = TsUnionType | TsIntersectionType;

export interface TsUnionOrIntersectionTypeBase extends TsTypeBase {
  types: Array<TsType>;
}

export interface TsUnionType extends TsUnionOrIntersectionTypeBase {
  type: "TSUnionType";
}

export interface TsIntersectionType extends TsUnionOrIntersectionTypeBase {
  type: "TSIntersectionType";
}

export interface TsConditionalType extends TsTypeBase {
  type: "TSConditionalType";
  checkType: TsType;
  extendsType: TsType;
  trueType: TsType;
  falseType: TsType;
}

export interface TsInferType extends TsTypeBase {
  type: "TSInferType";
  typeParameter: TypeParameter;
}

export interface TsParenthesizedType extends TsTypeBase {
  type: "TSParenthesizedType";
  typeAnnotation: TsType;
}

export interface TsTypeOperator extends TsTypeBase {
  type: "TSTypeOperator";
  operator: "keyof" | "unique" | "readonly";
  typeAnnotation: TsType;
}

export interface TsIndexedAccessType extends TsTypeBase {
  type: "TSIndexedAccessType";
  objectType: TsType;
  indexType: TsType;
}

export interface TsMappedType extends TsTypeBase {
  type: "TSMappedType";
  readonly?: true | "+" | "-";
  typeParameter: TsTypeParameter;
  optional?: true | "+" | "-";
  typeAnnotation: TsType | undefined | null;
  nameType: TsType | undefined | null;
}

export interface TsLiteralType extends TsTypeBase {
  type: "TSLiteralType";
  literal: NumericLiteral | StringLiteral | BooleanLiteral | TemplateLiteral;
}

export interface TsImportType extends TsTypeBase {
  type: "TsImportType";
  argument: StringLiteral;
  qualifier?: TsEntityName;
  typeParameters?: TsTypeParameterInstantiation;
}

// ================
// TypeScript declarations
// ================

export interface TsInterfaceDeclaration extends DeclarationBase {
  type: "TSInterfaceDeclaration";
  id: Identifier;
  typeParameters: TsTypeParameterDeclaration | undefined | null;
  // TS uses "heritageClauses", but want this to resemble ClassBase.
  extends?: Array<TsExpressionWithTypeArguments>;
  body: TSInterfaceBody;
}

export interface TSInterfaceBody extends NodeBase {
  type: "TSInterfaceBody";
  body: Array<TsTypeElement>;
}

export interface TsExpressionWithTypeArguments extends TsTypeBase {
  type: "TSExpressionWithTypeArguments";
  expression: TsEntityName;
  typeParameters?: TsTypeParameterInstantiation;
}

export interface TsTypeAliasDeclaration extends DeclarationBase {
  type: "TSTypeAliasDeclaration";
  id: Identifier;
  typeParameters: TsTypeParameterDeclaration | undefined | null;
  typeAnnotation: TsType;
}

export interface TsEnumDeclaration extends DeclarationBase {
  type: "TSEnumDeclaration";
  const?: true;
  id: Identifier;
  members: Array<TsEnumMember>;
}

export interface TsEnumMember extends NodeBase {
  type: "TSEnumMemodulmber";
  id: Identifier | StringLiteral;
  initializer?: Expression;
}

export interface TsModuleDeclaration extends DeclarationBase {
  type: "TSModuleDeclaration";
  global?: true; // In TypeScript, this is only available through `node.flags`.,
  id: TsModuleName;
  body: TsNamespaceBody;
}

// `namespace A.B { }` is a namespace named `A` with another TsNamespaceDeclaration as its body.
export type TsNamespaceBody = TsModuleBlock | TsNamespaceDeclaration;

export interface TsModuleBlock extends NodeBase {
  type: "TSModuleBlock";
  body: Array<Statement>;
}

export interface TsNamespaceDeclaration extends TsModuleDeclaration {
  id: Identifier;
  body: TsNamespaceBody;
}

export type TsModuleName = Identifier | StringLiteral;

export interface TsImportEqualsDeclaration extends NodeBase {
  type: "TSImportEqualsDeclaration";
  isExport: boolean;
  id: Identifier;
  importKind: "type" | "value";
  moduleReference: TsModuleReference;
}

export type TsModuleReference = TsEntityName | TsExternalModuleReference;

export interface TsExternalModuleReference extends NodeBase {
  type: "TSExternalModuleReference";
  expression: StringLiteral;
}

// TypeScript's own parser uses ExportAssignment for both `export default` and `export =`.
// But for @babel/parser, `export default` is an ExportDefaultDeclaration,
// so a TsExportAssignment is always `export =`.
export interface TsExportAssignment extends NodeBase {
  type: "TSExportAssignment";
  expression: Expression;
}

export interface TsNamespaceExportDeclaration extends NodeBase {
  type: "TSNamespaceExportDeclaration";
  id: Identifier;
}

// ================
// TypeScript expressions
// ================

export interface TsTypeAssertionLikeBase extends NodeBase {
  expression: Expression;
  typeAnnotation: TsType;
}

export interface TsAsExpression extends TsTypeAssertionLikeBase {
  type: "TSAsExpression";
}

export interface TsTypeAssertion extends TsTypeAssertionLikeBase {
  type: "TSTypeAssertion";
}

export interface TsNonNullExpression extends NodeBase {
  type: "TSNonNullExpression";
  expression: Expression;
}

// ================
// Babel placeholders %%foo%%
// ================

export interface Placeholder<N extends PlaceholderTypes = PlaceholderTypes>
  extends NodeBase {
  type: "Placeholder";
  id: Identifier;
  expectedNode: N;
}

// ================
// Other
// ================

export interface ParseSubscriptState {
  optionalChainMember: boolean;
  maybeAsyncArrow: boolean;
  stop: boolean;
}

export interface ParseClassMemberState {
  hadConstructor: boolean;
  hadSuperClass: boolean;
}
