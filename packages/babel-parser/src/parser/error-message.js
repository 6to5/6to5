// @flow

import { makeErrorTemplates, ErrorCodes } from "./error";

/* eslint sort-keys: "error" */

/**
 * @module parser/error-message
 */

// The Errors key follows https://cs.chromium.org/chromium/src/v8/src/common/message-template.h unless it does not exist
export const ErrorMessages = makeErrorTemplates(
  {
    AccessorIsGenerator: "A %0ter cannot be a generator.",
    ArgumentsInClass:
      "'arguments' is only allowed in functions and class methods.",
    AsyncFunctionInSingleStatementContext:
      "Async functions can only be declared at the top level or inside a block.",
    AwaitBindingIdentifier:
      "Can not use 'await' as identifier inside an async function.",
    AwaitBindingIdentifierInStaticBlock:
      "Can not use 'await' as identifier inside a static block.",
    AwaitExpressionFormalParameter:
      "'await' is not allowed in async function parameters.",
    AwaitNotInAsyncContext:
      "'await' is only allowed within async functions and at the top levels of modules.",
    AwaitNotInAsyncFunction: "'await' is only allowed within async functions.",
    BadGetterArity: "A 'get' accesor must not have any formal parameters.",
    BadSetterArity: "A 'set' accesor must have exactly one formal parameter.",
    BadSetterRestParameter:
      "A 'set' accesor function argument must not be a rest parameter.",
    ConstructorClassField: "Classes may not have a field named 'constructor'.",
    ConstructorClassPrivateField:
      "Classes may not have a private field named '#constructor'.",
    ConstructorIsAccessor: "Class constructor may not be an accessor.",
    ConstructorIsAsync: "Constructor can't be an async function.",
    ConstructorIsGenerator: "Constructor can't be a generator.",
    DeclarationMissingInitializer: "'%0' require an initialization value.",
    DecoratorBeforeExport:
      "Decorators must be placed *before* the 'export' keyword. You can set the 'decoratorsBeforeExport' option to false to use the 'export @decorator class {}' syntax.",
    DecoratorConstructor:
      "Decorators can't be used with a constructor. Did you mean '@dec class { ... }'?",
    DecoratorExportClass:
      "Using the export keyword between a decorator and a class is not allowed. Please use `export @dec class` instead.",
    DecoratorSemicolon: "Decorators must not be followed by a semicolon.",
    DecoratorStaticBlock: "Decorators can't be used with a static block.",
    DeletePrivateField: "Deleting a private field is not allowed.",
    DestructureNamedImport:
      "ES2015 named imports do not destructure. Use another statement for destructuring after the import.",
    DuplicateConstructor: "Duplicate constructor in the same class.",
    DuplicateDefaultExport: "Only one default export allowed per module.",
    DuplicateExport:
      "`%0` has already been exported. Exported identifiers must be unique.",
    DuplicateProto: "Redefinition of __proto__ property.",
    DuplicateRegExpFlags: "Duplicate regular expression flag.",
    ElementAfterRest: "Rest element must be last element.",
    EscapedCharNotAnIdentifier: "Invalid Unicode escape.",
    ExportBindingIsString:
      "A string literal cannot be used as an exported binding without `from`.\n- Did you mean `export { '%0' as '%1' } from 'some-module'`?",
    ExportDefaultFromAsIdentifier:
      "'from' is not allowed as an identifier after 'export default'.",
    ForInOfLoopInitializer:
      "'%0' loop variable declaration may not have an initializer.",
    ForOfAsync: "The left-hand side of a for-of loop may not be 'async'.",
    ForOfLet: "The left-hand side of a for-of loop may not start with 'let'.",
    GeneratorInSingleStatementContext:
      "Generators can only be declared at the top level or inside a block.",
    IllegalBreakContinue: "Unsyntactic %0.",
    IllegalLanguageModeDirective:
      "Illegal 'use strict' directive in function with non-simple parameter list.",
    IllegalReturn: "'return' outside of function.",
    ImportBindingIsString:
      'A string literal cannot be used as an imported binding.\n- Did you mean `import { "%0" as foo }`?',
    ImportCallArgumentTrailingComma:
      "Trailing comma is disallowed inside import(...) arguments.",
    ImportCallArity: "`import()` requires exactly %0.",
    ImportCallNotNewExpression: "Cannot use new with import(...).",
    ImportCallSpreadArgument: "`...` is not allowed in `import()`.",
    InvalidBigIntLiteral: "Invalid BigIntLiteral.",
    InvalidCodePoint: "Code point out of bounds.",
    InvalidDecimal: "Invalid decimal.",
    InvalidDigit: "Expected number in radix %0.",
    InvalidEscapeSequence: "Bad character escape sequence.",
    InvalidEscapeSequenceTemplate: "Invalid escape sequence in template.",
    InvalidEscapedReservedWord: "Escape sequence in keyword %0.",
    InvalidIdentifier: "Invalid identifier %0.",
    InvalidLhs: "Invalid left-hand side in %0.",
    InvalidLhsBinding: "Binding invalid left-hand side in %0.",
    InvalidNumber: "Invalid number.",
    InvalidOrMissingExponent:
      "Floating-point numbers require a valid exponent after the 'e'.",
    InvalidOrUnexpectedToken: "Unexpected character '%0'.",
    InvalidParenthesizedAssignment: "Invalid parenthesized assignment pattern.",
    InvalidPrivateFieldResolution: "Private name #%0 is not defined.",
    InvalidPropertyBindingPattern: "Binding member expression.",
    InvalidRecordProperty:
      "Only properties and spread elements are allowed in record definitions.",
    InvalidRestAssignmentPattern: "Invalid rest operator's argument.",
    LabelRedeclaration: "Label '%0' is already declared.",
    LetInLexicalBinding:
      "'let' is not allowed to be used as a name in 'let' or 'const' declarations.",
    LineTerminatorBeforeArrow: "No line break is allowed before '=>'.",
    MalformedRegExpFlags: "Invalid regular expression flag.",
    MissingClassName: "A class name is required.",
    MissingEqInAssignment:
      "Only '=' operator can be used for specifying default value.",
    MissingSemicolon: "Missing semicolon.",
    MissingUnicodeEscape: "Expecting Unicode escape sequence \\uXXXX.",
    MixingCoalesceWithLogical:
      "Nullish coalescing operator(??) requires parens when mixing with logical operators.",
    ModuleAttributeDifferentFromType:
      "The only accepted module attribute is `type`.",
    ModuleAttributeInvalidValue:
      "Only string literals are allowed as module attribute values.",
    ModuleAttributesWithDuplicateKeys:
      'Duplicate key "%0" is not allowed in module attributes.',
    ModuleExportNameHasLoneSurrogate:
      "An export name cannot include a lone surrogate, found '\\u%0'.",
    ModuleExportUndefined: "Export '%0' is not defined.",
    MultipleDefaultsInSwitch: "Multiple default clauses.",
    NewlineAfterThrow: "Illegal newline after throw.",
    NoCatchOrFinally: "Missing catch or finally clause.",
    NumberIdentifier: "Identifier directly after number.",
    NumericSeparatorInEscapeSequence:
      "Numeric separators are not allowed inside unicode escape sequences or hex escape sequences.",
    ObsoleteAwaitStar:
      "'await*' has been removed from the async functions proposal. Use Promise.all() instead.",
    OptionalChainingNoNew:
      "Constructors in/after an Optional Chain are not allowed.",
    OptionalChainingNoTemplate:
      "Tagged Template Literals are not allowed in optionalChain.",
    OverrideOnConstructor:
      "'override' modifier cannot appear on a constructor declaration.",
    ParamDupe: "Argument name clash.",
    PatternHasAccessor: "Object pattern can't contain getter or setter.",
    PatternHasMethod: "Object pattern can't contain methods.",
    PipeBodyIsTighter:
      "Unexpected %0 after pipeline body; any %0 expression acting as Hack-style pipe body must be parenthesized due to its loose operator precedence.",
    PipeTopicRequiresHackPipes:
      'Topic reference is used, but the pipelineOperator plugin was not passed a "proposal": "hack" or "smart" option.',
    PipeTopicUnbound:
      "Topic reference is unbound; it must be inside a pipe body.",
    PipeTopicUnconfiguredToken:
      'Invalid topic token %0. In order to use %0 as a topic reference, the pipelineOperator plugin must be configured with { "proposal": "hack", "topicToken": "%0" }.',
    PipeTopicUnused:
      "Hack-style pipe body does not contain a topic reference; Hack-style pipes must use topic at least once.",

    // Messages whose codes start with “Pipeline” or “PrimaryTopic”
    // are retained for backwards compatibility
    // with the deprecated smart-mix pipe operator proposal plugin.
    // They are subject to removal in a future major version.
    PipelineBodyNoArrow:
      'Unexpected arrow "=>" after pipeline body; arrow function in pipeline body must be parenthesized.',
    PipelineBodySequenceExpression:
      "Pipeline body may not be a comma-separated sequence expression.",
    PipelineHeadSequenceExpression:
      "Pipeline head should not be a comma-separated sequence expression.",
    PipelineTopicUnused:
      "Pipeline is in topic style but does not use topic reference.",
    PrimaryTopicNotAllowed:
      "Topic reference was used in a lexical context without topic binding.",
    PrimaryTopicRequiresSmartPipeline:
      'Topic reference is used, but the pipelineOperator plugin was not passed a "proposal": "hack" or "smart" option.',

    PrivateInExpectedIn:
      "Private names are only allowed in property accesses (`obj.#%0`) or in `in` expressions (`#%0 in obj`).",
    PrivateNameRedeclaration: "Duplicate private name #%0.",
    RecordExpressionBarIncorrectEndSyntaxType:
      "Record expressions ending with '|}' are only allowed when the 'syntaxType' option of the 'recordAndTuple' plugin is set to 'bar'.",
    RecordExpressionBarIncorrectStartSyntaxType:
      "Record expressions starting with '{|' are only allowed when the 'syntaxType' option of the 'recordAndTuple' plugin is set to 'bar'.",
    RecordExpressionHashIncorrectStartSyntaxType:
      "Record expressions starting with '#{' are only allowed when the 'syntaxType' option of the 'recordAndTuple' plugin is set to 'hash'.",
    RecordNoProto: "'__proto__' is not allowed in Record expressions.",
    RestTrailingComma: "Unexpected trailing comma after rest element.",
    SloppyFunction:
      "In non-strict mode code, functions can only be declared at top level, inside a block, or as the body of an if statement.",
    StaticPrototype: "Classes may not have static property named prototype.",
    StrictDelete: "Deleting local variable in strict mode.",
    StrictEvalArguments: "Assigning to '%0' in strict mode.",
    StrictEvalArgumentsBinding: "Binding '%0' in strict mode.",
    StrictFunction:
      "In strict mode code, functions can only be declared at top level or inside a block.",
    StrictNumericEscape:
      "The only valid numeric escape in strict mode is '\\0'.",
    StrictOctalLiteral: "Legacy octal literals are not allowed in strict mode.",
    StrictWith: "'with' in strict mode.",
    SuperNotAllowed:
      "`super()` is only valid inside a class constructor of a subclass. Maybe a typo in the method name ('constructor') or not extending another class?",
    SuperPrivateField: "Private fields can't be accessed on super.",
    TrailingDecorator: "Decorators must be attached to a class element.",
    TupleExpressionBarIncorrectEndSyntaxType:
      "Tuple expressions ending with '|]' are only allowed when the 'syntaxType' option of the 'recordAndTuple' plugin is set to 'bar'.",
    TupleExpressionBarIncorrectStartSyntaxType:
      "Tuple expressions starting with '[|' are only allowed when the 'syntaxType' option of the 'recordAndTuple' plugin is set to 'bar'.",
    TupleExpressionHashIncorrectStartSyntaxType:
      "Tuple expressions starting with '#[' are only allowed when the 'syntaxType' option of the 'recordAndTuple' plugin is set to 'hash'.",
    UnexpectedArgumentPlaceholder: "Unexpected argument placeholder.",
    UnexpectedAwaitAfterPipelineBody:
      'Unexpected "await" after pipeline body; await must have parentheses in minimal proposal.',
    UnexpectedDigitAfterHash: "Unexpected digit after hash token.",
    UnexpectedImportExport:
      "'import' and 'export' may only appear at the top level.",
    UnexpectedKeyword: "Unexpected keyword '%0'.",
    UnexpectedLeadingDecorator:
      "Leading decorators must be attached to a class declaration.",
    UnexpectedLexicalDeclaration:
      "Lexical declaration cannot appear in a single-statement context.",
    UnexpectedNewTarget:
      "`new.target` can only be used in functions or class properties.",
    UnexpectedNumericSeparator:
      "A numeric separator is only allowed between two digits.",
    UnexpectedPrivateField:
      "Private names can only be used as the name of a class element (i.e. class C { #p = 42; #m() {} } )\n or a property of member expression (i.e. this.#p).",
    UnexpectedReservedWord: "Unexpected reserved word '%0'.",
    UnexpectedSuper: "'super' is only allowed in object methods and classes.",
    UnexpectedToken: "Unexpected token '%0'.",
    UnexpectedTokenUnaryExponentiation:
      "Illegal expression. Wrap left hand side or entire exponentiation in parentheses.",
    UnsupportedBind: "Binding should be performed on object property.",
    UnsupportedDecoratorExport:
      "A decorated export must export a class declaration.",
    UnsupportedDefaultExport:
      "Only expressions, functions or classes are allowed as the `default` export.",
    UnsupportedImport:
      "`import` can only be used in `import()` or `import.meta`.",
    UnsupportedMetaProperty: "The only valid meta property for %0 is %0.%1.",
    UnsupportedParameterDecorator:
      "Decorators cannot be used to decorate parameters.",
    UnsupportedPropertyDecorator:
      "Decorators cannot be used to decorate object literal properties.",
    UnsupportedSuper:
      "'super' can only be used with function calls (i.e. super()) or in property accesses (i.e. super.prop or super[prop]).",
    UnterminatedComment: "Unterminated comment.",
    UnterminatedRegExp: "Unterminated regular expression.",
    UnterminatedString: "Unterminated string constant.",
    UnterminatedTemplate: "Unterminated template.",
    VarRedeclaration: "Identifier '%0' has already been declared.",
    YieldBindingIdentifier:
      "Can not use 'yield' as identifier inside a generator.",
    YieldInParameter: "Yield expression is not allowed in formal parameters.",
    ZeroDigitNumericSeparator:
      "Numeric separator can not be used after leading 0.",
  },
  /* code */ ErrorCodes.SyntaxError,
);

export const SourceTypeModuleErrorMessages = makeErrorTemplates(
  {
    ImportMetaOutsideModule: `import.meta may appear only with 'sourceType: "module"'`,
    ImportOutsideModule: `'import' and 'export' may appear only with 'sourceType: "module"'`,
  },
  /* code */ ErrorCodes.SourceTypeModuleError,
);
