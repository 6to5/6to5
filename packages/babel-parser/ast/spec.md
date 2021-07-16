These are the core @babel/parser (babylon) AST node types.

- [Node objects](#node-objects)
- [Changes](#changes)
- [Identifier](#identifier)
- [PrivateName](#privatename)
- [Literals](#literals)
  - [RegExpLiteral](#regexpliteral)
  - [NullLiteral](#nullliteral)
  - [StringLiteral](#stringliteral)
  - [BooleanLiteral](#booleanliteral)
  - [NumericLiteral](#numericliteral)
  - [BigIntLiteral](#bigintliteral)
  - [DecimalLiteral](#decimalliteral)
- [Programs](#programs)
- [Functions](#functions)
- [Statements](#statements)
  - [ExpressionStatement](#expressionstatement)
  - [BlockStatement](#blockstatement)
  - [EmptyStatement](#emptystatement)
  - [DebuggerStatement](#debuggerstatement)
  - [WithStatement](#withstatement)
  - [Control flow](#control-flow)
    - [ReturnStatement](#returnstatement)
    - [LabeledStatement](#labeledstatement)
    - [BreakStatement](#breakstatement)
    - [ContinueStatement](#continuestatement)
  - [Choice](#choice)
    - [IfStatement](#ifstatement)
    - [SwitchStatement](#switchstatement)
      - [SwitchCase](#switchcase)
  - [Exceptions](#exceptions)
    - [ThrowStatement](#throwstatement)
    - [TryStatement](#trystatement)
      - [CatchClause](#catchclause)
  - [Loops](#loops)
    - [WhileStatement](#whilestatement)
    - [DoWhileStatement](#dowhilestatement)
    - [ForStatement](#forstatement)
    - [ForInStatement](#forinstatement)
    - [ForOfStatement](#forofstatement)
- [Declarations](#declarations)
  - [FunctionDeclaration](#functiondeclaration)
  - [VariableDeclaration](#variabledeclaration)
    - [VariableDeclarator](#variabledeclarator)
- [Misc](#misc)
  - [Decorator](#decorator)
  - [Directive](#directive)
  - [DirectiveLiteral](#directiveliteral)
  - [InterpreterDirective](#interpreterdirective)
- [Expressions](#expressions)
  - [Super](#super)
  - [Import](#import)
  - [ThisExpression](#thisexpression)
  - [ArrowFunctionExpression](#arrowfunctionexpression)
  - [YieldExpression](#yieldexpression)
  - [AwaitExpression](#awaitexpression)
  - [ArrayExpression](#arrayexpression)
  - [ObjectExpression](#objectexpression)
    - [ObjectMember](#objectmember)
      - [ObjectProperty](#objectproperty)
      - [ObjectMethod](#objectmethod)
  - [RecordExpression](#recordexpression)
  - [TupleExpression](#tupleexpression)
  - [FunctionExpression](#functionexpression)
  - [Unary operations](#unary-operations)
    - [UnaryExpression](#unaryexpression)
      - [UnaryOperator](#unaryoperator)
    - [UpdateExpression](#updateexpression)
      - [UpdateOperator](#updateoperator)
  - [Binary operations](#binary-operations)
    - [BinaryExpression](#binaryexpression)
      - [BinaryOperator](#binaryoperator)
    - [AssignmentExpression](#assignmentexpression)
      - [AssignmentOperator](#assignmentoperator)
    - [LogicalExpression](#logicalexpression)
      - [LogicalOperator](#logicaloperator)
    - [SpreadElement](#spreadelement)
    - [ArgumentPlaceholder](#argumentplaceholder)
    - [MemberExpression](#memberexpression)
    - [OptionalMemberExpression](#optionalmemberexpression)
    - [BindExpression](#bindexpression)
  - [ConditionalExpression](#conditionalexpression)
  - [CallExpression](#callexpression)
  - [OptionalCallExpression](#optionalcallexpression)
  - [NewExpression](#newexpression)
  - [SequenceExpression](#sequenceexpression)
  - [ParenthesizedExpression](#parenthesizedexpression)
  - [DoExpression](#doexpression)
  - [ModuleExpression](#moduleexpression)
- [Template Literals](#template-literals)
  - [TemplateLiteral](#templateliteral)
  - [TaggedTemplateExpression](#taggedtemplateexpression)
  - [TemplateElement](#templateelement)
- [Patterns](#patterns)
  - [ObjectPattern](#objectpattern)
  - [ArrayPattern](#arraypattern)
  - [RestElement](#restelement)
  - [AssignmentPattern](#assignmentpattern)
- [Classes](#classes)
  - [ClassBody](#classbody)
  - [ClassMethod](#classmethod)
  - [ClassPrivateMethod](#classprivatemethod)
  - [ClassProperty](#classproperty)
  - [ClassPrivateProperty](#classprivateproperty)
  - [StaticBlock](#staticblock)
  - [ClassDeclaration](#classdeclaration)
  - [ClassExpression](#classexpression)
  - [MetaProperty](#metaproperty)
- [Modules](#modules)
  - [ModuleDeclaration](#moduledeclaration)
  - [ModuleSpecifier](#modulespecifier)
  - [Imports](#imports)
    - [ImportDeclaration](#importdeclaration)
    - [ImportSpecifier](#importspecifier)
    - [ImportDefaultSpecifier](#importdefaultspecifier)
    - [ImportNamespaceSpecifier](#importnamespacespecifier)
    - [ImportAttribute](#importattribute)
  - [Exports](#exports)
    - [ExportNamedDeclaration](#exportnameddeclaration)
    - [ExportSpecifier](#exportspecifier)
    - [ExportDefaultDeclaration](#exportdefaultdeclaration)
    - [ExportAllDeclaration](#exportalldeclaration)

# Node objects

AST nodes are represented as `Node` objects, which may have any prototype inheritance but which implement the following interface:

```js
interface Node {
  type: string;
  loc: SourceLocation | null;
}
```

The `type` field is a string representing the AST variant type. Each subtype of `Node` is documented below with the specific string of its `type` field. You can use this field to determine which interface a node implements.

The `loc` field represents the source location information of the node. If the node contains no information about the source location, the field is `null`; otherwise it is an object consisting of a start position (the position of the first character of the parsed source region) and an end position (the position of the first character after the parsed source region):

```js
interface SourceLocation {
  source: string | null;
  start: Position;
  end: Position;
}
```

Each `Position` object consists of a `line` number (1-indexed) and a `column` number (0-indexed):

```js
interface Position {
  line: number; // >= 1
  column: number; // >= 0
}
```

# Changes

### @babel/parser (Babylon) v7

Flow: Node renamed from `ExistentialTypeParam` to `ExistsTypeAnnotation` [#322](https://github.com/babel/babylon/pull/322)

Flow: Node renamed from `NumericLiteralTypeAnnotation` to `NumberLiteralTypeAnnotation` [babel/babylon#332](https://github.com/babel/babylon/pull/332)

Flow: Node `Variance` which replaces the string value of the `variance` field on several nodes [babel/babylon#333](https://github.com/babel/babylon/pull/333)

Flow: `ObjectTypeIndexer` location info matches Flow's better [babel/babylon#228](https://github.com/babel/babylon/pull/228)

Node `ForAwaitStatement` has been removed [#349](https://github.com/babel/babylon/pull/349) in favor of modifying `ForOfStatement`

`RestProperty` and `SpreadProperty` have been dropped in favor of `RestElement` and `SpreadElement`.

# Identifier

```js
interface Identifier <: Expression, Pattern {
  type: "Identifier";
  name: string;
}
```

An identifier. Note that an identifier may be an expression or a destructuring pattern.

# PrivateName

```js
interface PrivateName <: Node {
  type: "PrivateName";
  id: Identifier;
}
```

A Private Name Identifier.

# Literals

```js
interface Literal <: Expression { }
```

A literal token. May or may not represent an expression.

## RegExpLiteral

```js
interface RegExpLiteral <: Literal {
  type: "RegExpLiteral";
  pattern: string;
  flags: string;
}
```

## NullLiteral

```js
interface NullLiteral <: Literal {
  type: "NullLiteral";
}
```

## StringLiteral

```js
interface StringLiteral <: Literal {
  type: "StringLiteral";
  value: string;
}
```

## BooleanLiteral

```js
interface BooleanLiteral <: Literal {
  type: "BooleanLiteral";
  value: boolean;
}
```

## NumericLiteral

```js
interface NumericLiteral <: Literal {
  type: "NumericLiteral";
  value: number;
}
```

## BigIntLiteral

```js
interface BigIntLiteral <: Literal {
  type: "BigIntLiteral";
  value: string;
}
```

The `value` property is the string representation of the `BigInt` value. It doesn't include the suffix `n`.

## DecimalLiteral

```js
interface DecimalLiteral <: Literal {
  type: "DecimalLiteral";
  value: string;
}
```

The `value` property is the string representation of the `BigDecimal` value. It doesn't include the suffix `m`.

# Programs

```js
interface Program <: Node {
  type: "Program";
  interpreter: InterpreterDirective | null;
  sourceType: "script" | "module";
  body: [ Statement | ModuleDeclaration ];
  directives: [ Directive ];
}
```

A complete program source tree.

Parsers must specify `sourceType` as `"module"` if the source has been parsed as an ES6 module. Otherwise, `sourceType` must be `"script"`.

# Functions

```js
interface Function <: Node {
  id: Identifier | null;
  params: [ Pattern ];
  body: BlockStatement;
  generator: boolean;
  async: boolean;
}
```

A function [declaration](#functiondeclaration) or [expression](#functionexpression).

# Statements

```js
interface Statement <: Node { }
```

Any statement.

## ExpressionStatement

```js
interface ExpressionStatement <: Statement {
  type: "ExpressionStatement";
  expression: Expression;
}
```

An expression statement, i.e., a statement consisting of a single expression.

## BlockStatement

```js
interface BlockStatement <: Statement {
  type: "BlockStatement";
  body: [ Statement ];
  directives: [ Directive ];
}
```

A block statement, i.e., a sequence of statements surrounded by braces.

## EmptyStatement

```js
interface EmptyStatement <: Statement {
  type: "EmptyStatement";
}
```

An empty statement, i.e., a solitary semicolon.

## DebuggerStatement

```js
interface DebuggerStatement <: Statement {
  type: "DebuggerStatement";
}
```

A `debugger` statement.

## WithStatement

```js
interface WithStatement <: Statement {
  type: "WithStatement";
  object: Expression;
  body: Statement;
}
```

A `with` statement.

## Control flow

### ReturnStatement

```js
interface ReturnStatement <: Statement {
  type: "ReturnStatement";
  argument: Expression | null;
}
```

A `return` statement.

### LabeledStatement

```js
interface LabeledStatement <: Statement {
  type: "LabeledStatement";
  label: Identifier;
  body: Statement;
}
```

A labeled statement, i.e., a statement prefixed by a `break`/`continue` label.

### BreakStatement

```js
interface BreakStatement <: Statement {
  type: "BreakStatement";
  label: Identifier | null;
}
```

A `break` statement.

### ContinueStatement

```js
interface ContinueStatement <: Statement {
  type: "ContinueStatement";
  label: Identifier | null;
}
```

A `continue` statement.

## Choice

### IfStatement

```js
interface IfStatement <: Statement {
  type: "IfStatement";
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
}
```

An `if` statement.

### SwitchStatement

```js
interface SwitchStatement <: Statement {
  type: "SwitchStatement";
  discriminant: Expression;
  cases: [ SwitchCase ];
}
```

A `switch` statement.

#### SwitchCase

```js
interface SwitchCase <: Node {
  type: "SwitchCase";
  test: Expression | null;
  consequent: [ Statement ];
}
```

A `case` (if `test` is an `Expression`) or `default` (if `test === null`) clause in the body of a `switch` statement.

## Exceptions

### ThrowStatement

```js
interface ThrowStatement <: Statement {
  type: "ThrowStatement";
  argument: Expression;
}
```

A `throw` statement.

### TryStatement

```js
interface TryStatement <: Statement {
  type: "TryStatement";
  block: BlockStatement;
  handler: CatchClause | null;
  finalizer: BlockStatement | null;
}
```

A `try` statement. If `handler` is `null` then `finalizer` must be a `BlockStatement`.

#### CatchClause

```js
interface CatchClause <: Node {
  type: "CatchClause";
  param?: Pattern;
  body: BlockStatement;
}
```

A `catch` clause following a `try` block.

## Loops

### WhileStatement

```js
interface WhileStatement <: Statement {
  type: "WhileStatement";
  test: Expression;
  body: Statement;
}
```

A `while` statement.

### DoWhileStatement

```js
interface DoWhileStatement <: Statement {
  type: "DoWhileStatement";
  body: Statement;
  test: Expression;
}
```

A `do`/`while` statement.

### ForStatement

```js
interface ForStatement <: Statement {
  type: "ForStatement";
  init: VariableDeclaration | Expression | null;
  test: Expression | null;
  update: Expression | null;
  body: Statement;
}
```

A `for` statement.

### ForInStatement

```js
interface ForInStatement <: Statement {
  type: "ForInStatement";
  left: VariableDeclaration |  Expression;
  right: Expression;
  body: Statement;
}
```

A `for`/`in` statement.

## ForOfStatement

```js
interface ForOfStatement <: ForInStatement {
  type: "ForOfStatement";
  await: boolean;
}
```

# Declarations

```js
interface Declaration <: Statement { }
```

Any declaration node. Note that declarations are considered statements; this is because declarations can appear in any statement context.

## FunctionDeclaration

```js
interface FunctionDeclaration <: Function, Declaration {
  type: "FunctionDeclaration";
  id: Identifier;
}
```

A function declaration. Note that unlike in the parent interface `Function`, the `id` cannot be `null`, except when this is the child of an `ExportDefaultDeclaration`.

## VariableDeclaration

```js
interface VariableDeclaration <: Declaration {
  type: "VariableDeclaration";
  declarations: [ VariableDeclarator ];
  kind: "var" | "let" | "const";
}
```

A variable declaration.

### VariableDeclarator

```js
interface VariableDeclarator <: Node {
  type: "VariableDeclarator";
  id: Pattern;
  init: Expression | null;
}
```

A variable declarator.

# Misc

## Decorator

```js
interface Decorator <: Node {
  type: "Decorator";
  expression: Expression;
}
```

## Directive

```js
interface Directive <: Node {
  type: "Directive";
  value: DirectiveLiteral;
}
```

## DirectiveLiteral

```js
interface DirectiveLiteral <: StringLiteral {
  type: "DirectiveLiteral";
}
```

## InterpreterDirective

```js
interface InterpreterDirective <: StringLiteral {
  type: "InterpreterDirective";
}
```

# Expressions

```js
interface Expression <: Node { }
```

Any expression node. Since the left-hand side of an assignment may be any expression in general, an expression can also be a pattern.

## Super

```js
interface Super <: Node {
    type: "Super";
}
```

A `super` pseudo-expression.

## Import

```js
interface Import <: Node {
    type: "Import";
}
```

A `import` pseudo-expression.

## ThisExpression

```js
interface ThisExpression <: Expression {
  type: "ThisExpression";
}
```

A `this` expression.

## ArrowFunctionExpression

```js
interface ArrowFunctionExpression <: Function, Expression {
  type: "ArrowFunctionExpression";
  body: BlockStatement | Expression;
}
```

A fat arrow function expression, e.g., `let foo = (bar) => { /* body */ }`.

## YieldExpression

```js
interface YieldExpression <: Expression {
  type: "YieldExpression";
  argument: Expression | null;
  delegate: boolean;
}
```

A `yield` expression.

## AwaitExpression

```js
interface AwaitExpression <: Expression {
  type: "AwaitExpression";
  argument: Expression | null;
}
```

A `await` expression.

## ArrayExpression

```js
interface ArrayExpression <: Expression {
  type: "ArrayExpression";
  elements: [ Expression | SpreadElement | null ];
}
```

An array expression.

## ObjectExpression

```js
interface ObjectExpression <: Expression {
  type: "ObjectExpression";
  properties: [ ObjectProperty | ObjectMethod | SpreadElement ];
}
```

An object expression.

### ObjectMember

```js
interface ObjectMember <: Node {
  key: Expression;
  computed: boolean;
  decorators: [ Decorator ];
}
```

#### ObjectProperty

```js
interface ObjectProperty <: ObjectMember {
  type: "ObjectProperty";
  shorthand: boolean;
  value: Expression;
}
```

#### ObjectMethod

```js
interface ObjectMethod <: ObjectMember, Function {
  type: "ObjectMethod";
  kind: "get" | "set" | "method";
}
```

## RecordExpression

```js
interface RecordExpression <: Expression {
  type: "RecordExpression";
  properties: [ ObjectProperty | ObjectMethod | SpreadElement ];
}
```

## TupleExpression

```js
interface TupleExpression <: Expression {
  type: "TupleExpression";
  elements: [ Expression | SpreadElement | null ];
}
```

## FunctionExpression

```js
interface FunctionExpression <: Function, Expression {
  type: "FunctionExpression";
}
```

A `function` expression.

## Unary operations

### UnaryExpression

```js
interface UnaryExpression <: Expression {
  type: "UnaryExpression";
  operator: UnaryOperator;
  prefix: boolean;
  argument: Expression;
}
```

A unary operator expression.

#### UnaryOperator

```js
enum UnaryOperator {
  "-" | "+" | "!" | "~" | "typeof" | "void" | "delete" | "throw"
}
```

A unary operator token.

### UpdateExpression

```js
interface UpdateExpression <: Expression {
  type: "UpdateExpression";
  operator: UpdateOperator;
  argument: Expression;
  prefix: boolean;
}
```

An update (increment or decrement) operator expression.

#### UpdateOperator

```js
enum UpdateOperator {
  "++" | "--"
}
```

An update (increment or decrement) operator token.

## Binary operations

### BinaryExpression

```js
interface BinaryExpression <: Expression {
  type: "BinaryExpression";
  operator: BinaryOperator;
  left: Expression | PrivateName;
  right: Expression;
}
```

A binary operator expression. When `operator` is `in`, the `left` can be a `PrivateName`.

#### BinaryOperator

```js
enum BinaryOperator {
  "==" | "!=" | "===" | "!=="
     | "<" | "<=" | ">" | ">="
     | "<<" | ">>" | ">>>"
     | "+" | "-" | "*" | "/" | "%"
     | "**" | "|" | "^" | "&" | "in"
     | "instanceof"
     | "|>"
}
```

A binary operator token.

### AssignmentExpression

```js
interface AssignmentExpression <: Expression {
  type: "AssignmentExpression";
  operator: AssignmentOperator;
  left: Pattern | Expression;
  right: Expression;
}
```

An assignment operator expression. It has short-circuiting behaviour if the `operator` is one of `"||="`, `"&&="`, and `"??="`.

#### AssignmentOperator

```js
enum AssignmentOperator {
  "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "**="
    | "<<=" | ">>=" | ">>>="
    | "|=" | "^=" | "&="
    | "||=" | "&&=" | "??="
}
```

An assignment operator token.

### LogicalExpression

```js
interface LogicalExpression <: Expression {
  type: "LogicalExpression";
  operator: LogicalOperator;
  left: Expression;
  right: Expression;
}
```

A logical operator expression.

#### LogicalOperator

```js
enum LogicalOperator {
  "||" | "&&" | "??"
}
```

A logical operator token.

### SpreadElement

```js
interface SpreadElement <: Node {
  type: "SpreadElement";
  argument: Expression;
}
```

### ArgumentPlaceholder

```js
interface ArgumentPlaceholder <: Node {
    type: "ArgumentPlaceholder";
}
```

### MemberExpression

```js
interface MemberExpression <: Expression, Pattern {
  type: "MemberExpression";
  object: Expression | Super;
  property: Expression | PrivateName;
  computed: boolean;
}
```

A member expression. If `computed` is `true`, the node corresponds to a computed (`a[b]`) member expression and `property` is an `Expression`. If `computed` is `false`, the node corresponds to a static (`a.b`) member expression and `property` is an `Identifier` or a `PrivateName`.

### OptionalMemberExpression

```js
interface OptionalMemberExpression <: Expression {
  type: "OptionalMemberExpression";
  object: Expression;
  property: Expression | PrivateName;
  computed: boolean;
  optional: boolean;
}
```

An optional member expression is a part of the optional chain. When `optional` is `true`, it is the starting element of the optional chain. i.e. In `a?.b.c`, `?.b` is an optional member expression with `optional: true`, `.c` is an optional member expression. See this [gist](https://gist.github.com/JLHwung/567fb29fa2b82bbe164ad9067ff3290f) for more AST examples.

### BindExpression

```js
interface BindExpression <: Expression {
    type: "BindExpression";
    object: Expression | null;
    callee: Expression;
}
```

If `object` is `null`, then `callee` should be a `MemberExpression`.

## ConditionalExpression

```js
interface ConditionalExpression <: Expression {
  type: "ConditionalExpression";
  test: Expression;
  alternate: Expression;
  consequent: Expression;
}
```

A conditional expression, i.e., a ternary `?`/`:` expression.

## CallExpression

```js
interface CallExpression <: Expression {
  type: "CallExpression";
  callee: Expression | Super | Import;
  arguments: [ Expression | SpreadElement ];
}
```

A function or method call expression. When the `callee` is `Import`, the `arguments` must have only one `Expression` element.

## OptionalCallExpression

```js
interface OptionalCallExpression <: Expression {
  type: "OptionalCallExpression";
  callee: Expression;
  arguments: [ Expression | SpreadElement ];
  optional: boolean;
}
```

An optional call expression is a part of the optional chain. When `optional` is `true`, it is the starting element of the optional chain. i.e. In `f?.()()`, `?.()` is an optional call expression with `optional: true`, `()` is an optional call expression with `optional: false`. See this [gist](https://gist.github.com/JLHwung/567fb29fa2b82bbe164ad9067ff3290f) for more AST examples.

## NewExpression

```js
interface NewExpression <: CallExpression {
  type: "NewExpression";
}
```

A `new` expression.

## SequenceExpression

```js
interface SequenceExpression <: Expression {
  type: "SequenceExpression";
  expressions: [ Expression ];
}
```

A sequence expression, i.e., a comma-separated sequence of expressions.

## ParenthesizedExpression

```js
interface ParenthesizedExpression <: Expression {
    type "ParenthesizedExpression";
    expression: Expression;
}
```

An expression wrapped by parentheses. By default `@babel/parser` does not create this node, unless the `createParenthesizedExpressions: true` option is passed.

## DoExpression

```js
interface DoExpression <: Expression {
  type: "DoExpression";
  body: BlockStatement;
  async: boolean;
}
```

## ModuleExpression

```js
interface ModuleExpression <: Expression {
  type: "ModuleExpression";
  body: Program
}
```

A inline module expression proposed in https://github.com/tc39/proposal-js-module-blocks.

## TopicReference

```js
interface TopicReference <: Expression {
  type: "TopicReference";
}
```

A topic reference to be used inside the body of
a [Hack-style pipe expression](https://github.com/js-choi/proposal-hack-pipes).

# Template Literals

## TemplateLiteral

```js
interface TemplateLiteral <: Expression {
  type: "TemplateLiteral";
  quasis: [ TemplateElement ];
  expressions: [ Expression ];
}
```

## TaggedTemplateExpression

```js
interface TaggedTemplateExpression <: Expression {
  type: "TaggedTemplateExpression";
  tag: Expression;
  quasi: TemplateLiteral;
}
```

## TemplateElement

```js
interface TemplateElement <: Node {
  type: "TemplateElement";
  tail: boolean;
  value: {
    cooked: string | null;
    raw: string;
  };
}
```

# Patterns

```js
interface Pattern <: Node { }
```

## ObjectPattern

```js
interface AssignmentProperty <: ObjectProperty {
  value: Pattern;
}

interface ObjectPattern <: Pattern {
  type: "ObjectPattern";
  properties: [ AssignmentProperty | RestElement ];
}
```

## ArrayPattern

```js
interface ArrayPattern <: Pattern {
  type: "ArrayPattern";
  elements: [ Pattern | null ];
}
```

## RestElement

```js
interface RestElement <: Pattern {
  type: "RestElement";
  argument: Pattern;
}
```

## AssignmentPattern

```js
interface AssignmentPattern <: Pattern {
  type: "AssignmentPattern";
  left: Pattern;
  right: Expression;
}
```

# Classes

```js
interface Class <: Node {
  id: Identifier | null;
  superClass: Expression | null;
  body: ClassBody;
  decorators: [ Decorator ];
}
```

## ClassBody

```js
interface ClassBody <: Node {
  type: "ClassBody";
  body: [ ClassMethod | ClassPrivateMethod | ClassProperty | ClassPrivateProperty | StaticBlock ];
}
```

## ClassMethod

```js
interface ClassMethod <: Function {
  type: "ClassMethod";
  key: Expression;
  kind: "constructor" | "method" | "get" | "set";
  computed: boolean;
  static: boolean;
  decorators: [ Decorator ];
}
```

## ClassPrivateMethod

```js
interface ClassPrivateMethod <: Function {
  type: "ClassPrivateMethod";
  key: PrivateName;
  kind: "method" | "get" | "set";
  static: boolean;
  decorators: [ Decorator ];
}
```

## ClassProperty

```js
interface ClassProperty <: Node {
  type: "ClassProperty";
  key: Expression;
  value: Expression;
  static: boolean;
  computed: boolean;
}
```

## ClassPrivateProperty

```js
interface ClassPrivateProperty <: Node {
  type: "ClassPrivateProperty";
  key: PrivateName;
  value: Expression;
  static: boolean;
}
```

## StaticBlock

```js
interface StaticBlock <: Node {
  type: "StaticBlock";
  body: [ Statement ];
}
```

A static block proposed in https://github.com/tc39/proposal-class-static-block.

## ClassDeclaration

```js
interface ClassDeclaration <: Class, Declaration {
  type: "ClassDeclaration";
  id: Identifier;
}
```

## ClassExpression

```js
interface ClassExpression <: Class, Expression {
  type: "ClassExpression";
}
```

## MetaProperty

```js
interface MetaProperty <: Expression {
  type: "MetaProperty";
  meta: Identifier;
  property: Identifier;
}
```

# Modules

## ModuleDeclaration

```js
interface ModuleDeclaration <: Node { }
```

A module `import` or `export` declaration.

## ModuleSpecifier

```js
interface ModuleSpecifier <: Node {
  local: Identifier;
}
```

A specifier in an import or export declaration.

## Imports

### ImportDeclaration

```js
interface ImportDeclaration <: ModuleDeclaration {
  type: "ImportDeclaration";
  importKind: null | "type" | "typeof" | "value";
  specifiers: [ ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier ];
  source: StringLiteral;
  assertions?: [ ImportAttribute ];
}
```

An import declaration, e.g., `import foo from "mod";`.

> importKind is only set when `flow` plugin enabled in babel-parser

### ImportSpecifier

```js
interface ImportSpecifier <: ModuleSpecifier {
  type: "ImportSpecifier";
  imported: Identifier | StringLiteral;
}
```

An imported variable binding, e.g., `{foo}` in `import {foo} from "mod"` or `{foo as bar}` in `import {foo as bar} from "mod"`. The `imported` field refers to the name of the export imported from the module. The `local` field refers to the binding imported into the local module scope. If it is a basic named import, such as in `import {foo} from "mod"`, both `imported` and `local` are equivalent `Identifier` nodes; in this case an `Identifier` node representing `foo`. If it is an aliased import, such as in `import {foo as bar} from "mod"`, the `imported` field is an `Identifier` node representing `foo`, and the `local` field is an `Identifier` node representing `bar`.

### ImportDefaultSpecifier

```js
interface ImportDefaultSpecifier <: ModuleSpecifier {
  type: "ImportDefaultSpecifier";
}
```

A default import specifier, e.g., `foo` in `import foo from "mod.js"`.

### ImportNamespaceSpecifier

```js
interface ImportNamespaceSpecifier <: ModuleSpecifier {
  type: "ImportNamespaceSpecifier";
}
```

A namespace import specifier, e.g., `* as foo` in `import * as foo from "mod.js"`.

### ImportAttribute

```js
interface ImportAttribute <: Node {
  type: "ImportAttribute";
  key: Identifier;
  value: StringLiteral;
}
```

An attribute specified on the ImportDeclaration.

## Exports

### ExportNamedDeclaration

```js
interface ExportNamedDeclaration <: ModuleDeclaration {
  type: "ExportNamedDeclaration";
  declaration: Declaration | null;
  specifiers: [ ExportSpecifier ];
  source: StringLiteral | null;
  assertions?: [ ImportAttribute ];
}
```

An export named declaration, e.g., `export {foo, bar};`, `export {foo} from "mod";`, `export var foo = 1;` or `export * as foo from "bar";`.

Note:

- Having `declaration` populated with non-empty `specifiers` or non-null `source` results in an invalid state.
- If `source` is `null`, for each `specifier` of `specifiers`, `specifier.local` can not be a `StringLiteral`.

### ExportSpecifier

```js
interface ExportSpecifier <: ModuleSpecifier {
  type: "ExportSpecifier";
  exported: Identifier | StringLiteral;
  local?: Identifier | StringLiteral;
}
```

An exported variable binding, e.g., `{foo}` in `export {foo}` or `{bar as foo}` in `export {bar as foo}`. The `exported` field refers to the name exported in the module. The `local` field refers to the binding into the local module scope. If it is a basic named export, such as in `export {foo}`, both `exported` and `local` are equivalent `Identifier` nodes; in this case an `Identifier` node representing `foo`. If it is an aliased export, such as in `export {bar as foo}`, the `exported` field is an `Identifier` node representing `foo`, and the `local` field is an `Identifier` node representing `bar`.

### ExportDefaultDeclaration

```js
interface OptFunctionDeclaration <: FunctionDeclaration {
  id: Identifier | null;
}

interface OptClassDeclaration <: ClassDeclaration {
  id: Identifier | null;
}

interface ExportDefaultDeclaration <: ModuleDeclaration {
  type: "ExportDefaultDeclaration";
  declaration: OptFunctionDeclaration | OptClassDeclaration | Expression;
}
```

An export default declaration, e.g., `export default function () {};` or `export default 1;`.

### ExportAllDeclaration

```js
interface ExportAllDeclaration <: ModuleDeclaration {
  type: "ExportAllDeclaration";
  source: StringLiteral;
  assertions?: [ ImportAttribute ];
}
```

An export batch declaration, e.g., `export * from "mod";`.

### Smart-mix pipelines

These types are **deprecated**.
They are used by the deprecated smart-mix pipe operator to determine
the type of a pipe expression's the body expression.
The Hack and F# pipe operators use simple `BinaryExpression`s.

#### PipelineBody

```js
interface PipelineBody <: NodeBase {
    type: "PipelineBody";
}
```

#### PipelineBareFunctionBody

```js
interface PipelineBody <: NodeBase {
    type: "PipelineBareFunctionBody";
    callee: Expression;
}
```

#### PipelineBareConstructorBody

```js
interface PipelineBareConstructorBody <: NodeBase {
    type: "PipelineBareConstructorBody";
    callee: Expression;
}
```

#### PipelineBareAwaitedFunctionBody

```js
interface PipelineBareConstructorBody <: NodeBase {
    type: "PipelineTopicBody";
    expression: Expression;
}
```

#### PipelineTopicBody

```js
interface PipelineBareConstructorBody <: NodeBase {
    type: "PipelineBareAwaitedFunctionBody";
    callee: Expression;
}
