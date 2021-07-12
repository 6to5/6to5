// @flow
import type { TokContext } from "./context";
// ## Token types

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between 1) binary
// expression (<) and JSX Tag start (<name>); 2) object literal and JSX
// texts. It is set on the `updateContext` function in the JSX plugin.

// The `startsExpr` property is used to determine whether an expression
// may be the “argument” subexpression of a `yield` expression or
// `yield` statement. It is set on all token types that may be at the
// start of a subexpression.

// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

const beforeExpr = true;
const startsExpr = true;
const isLoop = true;
const isAssign = true;
const prefix = true;
const postfix = true;

type TokenOptions = {
  keyword?: string,
  beforeExpr?: boolean,
  startsExpr?: boolean,
  rightAssociative?: boolean,
  isLoop?: boolean,
  isAssign?: boolean,
  prefix?: boolean,
  postfix?: boolean,
  binop?: ?number,
};

export class TokenType {
  label: string;
  keyword: ?string;
  beforeExpr: boolean;
  startsExpr: boolean;
  rightAssociative: boolean;
  isLoop: boolean;
  isAssign: boolean;
  prefix: boolean;
  postfix: boolean;
  binop: ?number;
  updateContext: ?(context: Array<TokContext>) => void;

  constructor(label: string, conf: TokenOptions = {}) {
    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.rightAssociative = !!conf.rightAssociative;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop != null ? conf.binop : null;
    this.updateContext = null;
  }
}

export const keywords = new Map<string, TokenType>();

function createKeyword(name: string, options: TokenOptions = {}): TokenType {
  options.keyword = name;
  const token = new TokenType(name, options);
  keywords.set(name, token);
  return token;
}

function createBinop(name: string, binop: number) {
  return new TokenType(name, { beforeExpr, binop });
}

export const types: { [name: string]: TokenType } = {
  num: new TokenType("num", { startsExpr }),
  bigint: new TokenType("bigint", { startsExpr }),
  decimal: new TokenType("decimal", { startsExpr }),
  regexp: new TokenType("regexp", { startsExpr }),
  string: new TokenType("string", { startsExpr }),
  name: new TokenType("name", { startsExpr }),
  privateName: new TokenType("#name", { startsExpr }),
  eof: new TokenType("eof"),

  // Punctuation token types.
  bracketL: new TokenType("[", { beforeExpr, startsExpr }),
  bracketHashL: new TokenType("#[", { beforeExpr, startsExpr }),
  bracketBarL: new TokenType("[|", { beforeExpr, startsExpr }),
  bracketR: new TokenType("]"),
  bracketBarR: new TokenType("|]"),
  braceL: new TokenType("{", { beforeExpr, startsExpr }),
  braceBarL: new TokenType("{|", { beforeExpr, startsExpr }),
  braceHashL: new TokenType("#{", { beforeExpr, startsExpr }),
  braceR: new TokenType("}", { beforeExpr }),
  braceBarR: new TokenType("|}"),
  parenL: new TokenType("(", { beforeExpr, startsExpr }),
  parenR: new TokenType(")"),
  comma: new TokenType(",", { beforeExpr }),
  semi: new TokenType(";", { beforeExpr }),
  colon: new TokenType(":", { beforeExpr }),
  doubleColon: new TokenType("::", { beforeExpr }),
  dot: new TokenType("."),
  question: new TokenType("?", { beforeExpr }),
  questionDot: new TokenType("?."),
  arrow: new TokenType("=>", { beforeExpr }),
  template: new TokenType("template"),
  ellipsis: new TokenType("...", { beforeExpr }),
  backQuote: new TokenType("`", { startsExpr }),
  dollarBraceL: new TokenType("${", { beforeExpr, startsExpr }),
  at: new TokenType("@"),
  hash: new TokenType("#", { startsExpr }),

  // Special hashbang token.
  interpreterDirective: new TokenType("#!..."),

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  eq: new TokenType("=", { beforeExpr, isAssign }),
  assign: new TokenType("_=", { beforeExpr, isAssign }),
  slashAssign: new TokenType("_=", { beforeExpr, isAssign }),
  // This is only needed to support % as a Hack-pipe topic token. If the proposal
  // ends up choosing a different token, it can be merged with tt.assign.
  moduloAssign: new TokenType("_=", { beforeExpr, isAssign }),
  incDec: new TokenType("++/--", { prefix, postfix, startsExpr }),
  bang: new TokenType("!", { beforeExpr, prefix, startsExpr }),
  tilde: new TokenType("~", { beforeExpr, prefix, startsExpr }),
  pipeline: createBinop("|>", 0),
  nullishCoalescing: createBinop("??", 1),
  logicalOR: createBinop("||", 1),
  logicalAND: createBinop("&&", 2),
  bitwiseOR: createBinop("|", 3),
  bitwiseXOR: createBinop("^", 4),
  bitwiseAND: createBinop("&", 5),
  equality: createBinop("==/!=/===/!==", 6),
  relational: createBinop("</>/<=/>=", 7),
  bitShift: createBinop("<</>>/>>>", 8),
  plusMin: new TokenType("+/-", { beforeExpr, binop: 9, prefix, startsExpr }),
  // startsExpr: required by v8intrinsic plugin
  modulo: new TokenType("%", { binop: 10, startsExpr }),
  // unset `beforeExpr` as it can be `function *`
  star: new TokenType("*", { binop: 10 }),
  slash: createBinop("/", 10),
  exponent: new TokenType("**", {
    beforeExpr,
    binop: 11,
    rightAssociative: true,
  }),

  // Keywords
  // Don't forget to update packages/babel-helper-validator-identifier/src/keyword.js
  // when new keywords are added
  _break: createKeyword("break"),
  _case: createKeyword("case", { beforeExpr }),
  _catch: createKeyword("catch"),
  _continue: createKeyword("continue"),
  _debugger: createKeyword("debugger"),
  _default: createKeyword("default", { beforeExpr }),
  _do: createKeyword("do", { isLoop, beforeExpr }),
  _else: createKeyword("else", { beforeExpr }),
  _finally: createKeyword("finally"),
  _for: createKeyword("for", { isLoop }),
  _function: createKeyword("function", { startsExpr }),
  _if: createKeyword("if"),
  _return: createKeyword("return", { beforeExpr }),
  _switch: createKeyword("switch"),
  _throw: createKeyword("throw", { beforeExpr, prefix, startsExpr }),
  _try: createKeyword("try"),
  _var: createKeyword("var"),
  _const: createKeyword("const"),
  _while: createKeyword("while", { isLoop }),
  _with: createKeyword("with"),
  _new: createKeyword("new", { beforeExpr, startsExpr }),
  _this: createKeyword("this", { startsExpr }),
  _super: createKeyword("super", { startsExpr }),
  _class: createKeyword("class", { startsExpr }),
  _extends: createKeyword("extends", { beforeExpr }),
  _export: createKeyword("export"),
  _import: createKeyword("import", { startsExpr }),
  _null: createKeyword("null", { startsExpr }),
  _true: createKeyword("true", { startsExpr }),
  _false: createKeyword("false", { startsExpr }),
  _in: createKeyword("in", { beforeExpr, binop: 7 }),
  _instanceof: createKeyword("instanceof", { beforeExpr, binop: 7 }),
  _typeof: createKeyword("typeof", { beforeExpr, prefix, startsExpr }),
  _void: createKeyword("void", { beforeExpr, prefix, startsExpr }),
  _delete: createKeyword("delete", { beforeExpr, prefix, startsExpr }),
};
