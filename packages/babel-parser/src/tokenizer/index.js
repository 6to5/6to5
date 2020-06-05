// @flow

/*:: declare var invariant; */

import type { Options } from "../options";
import * as N from "../types";
import type { Position } from "../util/location";
import * as charCodes from "charcodes";
import { isIdentifierStart, isIdentifierChar } from "../util/identifier";
import { types as tt, keywords as keywordTypes, type TokenType } from "./types";
import { type TokContext, types as ct } from "./context";
import ParserErrors, { Errors } from "../parser/error";
import { SourceLocation } from "../util/location";
import {
  lineBreak,
  lineBreakG,
  isNewLine,
  isWhitespace,
  skipWhiteSpace,
} from "../util/whitespace";
import State from "./state";

const VALID_REGEX_FLAGS = new Set(["g", "m", "s", "i", "y", "u"]);

// The following character codes are forbidden from being
// an immediate sibling of NumericLiteralSeparator _

const forbiddenNumericSeparatorSiblings = {
  decBinOct: [
    charCodes.dot,
    charCodes.uppercaseB,
    charCodes.uppercaseE,
    charCodes.uppercaseO,
    charCodes.underscore, // multiple separators are not allowed
    charCodes.lowercaseB,
    charCodes.lowercaseE,
    charCodes.lowercaseO,
  ],
  hex: [
    charCodes.dot,
    charCodes.uppercaseX,
    charCodes.underscore, // multiple separators are not allowed
    charCodes.lowercaseX,
  ],
};

const allowedNumericSeparatorSiblings = {};
allowedNumericSeparatorSiblings.bin = [
  // 0 - 1
  charCodes.digit0,
  charCodes.digit1,
];
allowedNumericSeparatorSiblings.oct = [
  // 0 - 7
  ...allowedNumericSeparatorSiblings.bin,

  charCodes.digit2,
  charCodes.digit3,
  charCodes.digit4,
  charCodes.digit5,
  charCodes.digit6,
  charCodes.digit7,
];
allowedNumericSeparatorSiblings.dec = [
  // 0 - 9
  ...allowedNumericSeparatorSiblings.oct,

  charCodes.digit8,
  charCodes.digit9,
];

allowedNumericSeparatorSiblings.hex = [
  // 0 - 9, A - F, a - f,
  ...allowedNumericSeparatorSiblings.dec,

  charCodes.uppercaseA,
  charCodes.uppercaseB,
  charCodes.uppercaseC,
  charCodes.uppercaseD,
  charCodes.uppercaseE,
  charCodes.uppercaseF,

  charCodes.lowercaseA,
  charCodes.lowercaseB,
  charCodes.lowercaseC,
  charCodes.lowercaseD,
  charCodes.lowercaseE,
  charCodes.lowercaseF,
];

// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

export class Token {
  constructor(state: State) {
    this.type = state.type;
    this.value = state.value;
    this.start = state.start;
    this.end = state.end;
    this.loc = new SourceLocation(state.startLoc, state.endLoc);
  }

  type: TokenType;
  value: any;
  start: number;
  end: number;
  loc: SourceLocation;
}

// ## Tokenizer

export default class Tokenizer extends ParserErrors {
  // Forward-declarations
  // parser/util.js
  /*::
  +unexpected: (pos?: ?number, messageOrType?: string | TokenType) => empty;
  +expectPlugin: (name: string, pos?: ?number) => true;
  */

  isLookahead: boolean;

  // Token store.
  tokens: Array<Token | N.Comment> = [];

  constructor(options: Options, input: string) {
    super();
    this.state = new State();
    this.state.init(options);
    this.input = input;
    this.length = input.length;
    this.isLookahead = false;
  }

  pushToken(token: Token | N.Comment) {
    // Pop out invalid tokens trapped by try-catch parsing.
    // Those parsing branches are mainly created by typescript and flow plugins.
    this.tokens.length = this.state.tokensLength;
    this.tokens.push(token);
    ++this.state.tokensLength;
  }

  // Move to the next token

  next(): void {
    if (!this.isLookahead) {
      this.checkKeywordEscapes();
      if (this.options.tokens) {
        this.pushToken(new Token(this.state));
      }
    }

    this.state.lastTokEnd = this.state.end;
    this.state.lastTokStart = this.state.start;
    this.state.lastTokEndLoc = this.state.endLoc;
    this.state.lastTokStartLoc = this.state.startLoc;
    this.nextToken();
  }

  // TODO

  eat(type: TokenType): boolean {
    if (this.match(type)) {
      this.next();
      return true;
    } else {
      return false;
    }
  }

  // TODO

  match(type: TokenType): boolean {
    return this.state.type === type;
  }

  // TODO

  lookahead(): State {
    const old = this.state;
    this.state = old.clone(true);

    this.isLookahead = true;
    this.next();
    this.isLookahead = false;

    const curr = this.state;
    this.state = old;
    return curr;
  }

  nextTokenStart(): number {
    const thisTokEnd = this.state.pos;
    skipWhiteSpace.lastIndex = thisTokEnd;
    const skip = skipWhiteSpace.exec(this.input);
    // $FlowIgnore: The skipWhiteSpace ensures to match any string
    return thisTokEnd + skip[0].length;
  }

  lookaheadCharCode(): number {
    return this.input.charCodeAt(this.nextTokenStart());
  }

  // Toggle strict mode. Re-reads the next number or string to please
  // pedantic tests (`"use strict"; 010;` should fail).

  setStrict(strict: boolean): void {
    this.state.strict = strict;
    if (!this.match(tt.num) && !this.match(tt.string)) return;
    this.state.pos = this.state.start;
    while (this.state.pos < this.state.lineStart) {
      this.state.lineStart =
        this.input.lastIndexOf("\n", this.state.lineStart - 2) + 1;
      --this.state.curLine;
    }
    this.nextToken();
  }

  curContext(): TokContext {
    return this.state.context[this.state.context.length - 1];
  }

  // Read a single token, updating the parser object's token-related
  // properties.

  nextToken(): void {
    const curContext = this.curContext();
    if (!curContext?.preserveSpace) this.skipSpace();

    this.state.octalPositions = [];
    this.state.start = this.state.pos;
    this.state.startLoc = this.state.curPosition();
    if (this.state.pos >= this.length) {
      this.finishToken(tt.eof);
      return;
    }

    const override = curContext?.override;
    if (override) {
      override(this);
    } else {
      this.getTokenFromCode(this.input.codePointAt(this.state.pos));
    }
  }

  pushComment(
    block: boolean,
    text: string,
    start: number,
    end: number,
    startLoc: Position,
    endLoc: Position,
  ): void {
    const comment = {
      type: block ? "CommentBlock" : "CommentLine",
      value: text,
      start: start,
      end: end,
      loc: new SourceLocation(startLoc, endLoc),
    };

    if (this.options.tokens) this.pushToken(comment);
    this.state.comments.push(comment);
    this.addComment(comment);
  }

  skipBlockComment(): void {
    const startLoc = this.state.curPosition();
    const start = this.state.pos;
    const end = this.input.indexOf("*/", this.state.pos + 2);
    if (end === -1) throw this.raise(start, Errors.UnterminatedComment);

    this.state.pos = end + 2;
    lineBreakG.lastIndex = start;
    let match;
    while (
      (match = lineBreakG.exec(this.input)) &&
      match.index < this.state.pos
    ) {
      ++this.state.curLine;
      this.state.lineStart = match.index + match[0].length;
    }

    // If we are doing a lookahead right now we need to advance the position (above code)
    // but we do not want to push the comment to the state.
    if (this.isLookahead) return;

    this.pushComment(
      true,
      this.input.slice(start + 2, end),
      start,
      this.state.pos,
      startLoc,
      this.state.curPosition(),
    );
  }

  skipLineComment(startSkip: number): void {
    const start = this.state.pos;
    const startLoc = this.state.curPosition();
    let ch = this.input.charCodeAt((this.state.pos += startSkip));
    if (this.state.pos < this.length) {
      while (!isNewLine(ch) && ++this.state.pos < this.length) {
        ch = this.input.charCodeAt(this.state.pos);
      }
    }

    // If we are doing a lookahead right now we need to advance the position (above code)
    // but we do not want to push the comment to the state.
    if (this.isLookahead) return;

    this.pushComment(
      false,
      this.input.slice(start + startSkip, this.state.pos),
      start,
      this.state.pos,
      startLoc,
      this.state.curPosition(),
    );
  }

  // Called at the start of the parse and after every token. Skips
  // whitespace and comments, and.

  skipSpace(): void {
    loop: while (this.state.pos < this.length) {
      const ch = this.input.charCodeAt(this.state.pos);
      switch (ch) {
        case charCodes.space:
        case charCodes.nonBreakingSpace:
        case charCodes.tab:
          ++this.state.pos;
          break;
        case charCodes.carriageReturn:
          if (
            this.input.charCodeAt(this.state.pos + 1) === charCodes.lineFeed
          ) {
            ++this.state.pos;
          }
        // fall through
        case charCodes.lineFeed:
        case charCodes.lineSeparator:
        case charCodes.paragraphSeparator:
          ++this.state.pos;
          ++this.state.curLine;
          this.state.lineStart = this.state.pos;
          break;

        case charCodes.slash:
          switch (this.input.charCodeAt(this.state.pos + 1)) {
            case charCodes.asterisk:
              this.skipBlockComment();
              break;

            case charCodes.slash:
              this.skipLineComment(2);
              break;

            default:
              break loop;
          }
          break;

        default:
          if (isWhitespace(ch)) {
            ++this.state.pos;
          } else {
            break loop;
          }
      }
    }
  }

  // Called at the end of every token. Sets `end`, `val`, and
  // maintains `context` and `exprAllowed`, and skips the space after
  // the token, so that the next one's `start` will point at the
  // right position.

  finishToken(type: TokenType, val: any): void {
    this.state.end = this.state.pos;
    this.state.endLoc = this.state.curPosition();
    const prevType = this.state.type;
    this.state.type = type;
    this.state.value = val;

    if (!this.isLookahead) this.updateContext(prevType);
  }

  // ### Token reading

  // This is the function that is called to fetch the next token. It
  // is somewhat obscure, because it works in character codes rather
  // than characters, and because operator parsing has been inlined
  // into it.
  //
  // All in the name of speed.

  // number sign is "#"
  readToken_numberSign(): void {
    if (this.state.pos === 0 && this.readToken_interpreter()) {
      return;
    }

    const nextPos = this.state.pos + 1;
    const next = this.input.charCodeAt(nextPos);
    if (next >= charCodes.digit0 && next <= charCodes.digit9) {
      throw this.raise(this.state.pos, Errors.UnexpectedDigitAfterHash);
    }

    if (
      next === charCodes.leftCurlyBrace ||
      (next === charCodes.leftSquareBracket && this.hasPlugin("recordAndTuple"))
    ) {
      // When we see `#{`, it is likely to be a hash record.
      // However we don't yell at `#[` since users may intend to use "computed private fields",
      // which is not allowed in the spec. Throwing expecting recordAndTuple is
      // misleading
      this.expectPlugin("recordAndTuple");
      if (this.getPluginOption("recordAndTuple", "syntaxType") !== "hash") {
        throw this.raise(
          this.state.pos,
          next === charCodes.leftCurlyBrace
            ? Errors.RecordExpressionHashIncorrectStartSyntaxType
            : Errors.TupleExpressionHashIncorrectStartSyntaxType,
        );
      }

      if (next === charCodes.leftCurlyBrace) {
        // #{
        this.finishToken(tt.braceHashL);
      } else {
        // #[
        this.finishToken(tt.bracketHashL);
      }
      this.state.pos += 2;
    } else {
      this.finishOp(tt.hash, 1);
    }
  }

  readToken_dot(): void {
    const next = this.input.charCodeAt(this.state.pos + 1);
    if (next >= charCodes.digit0 && next <= charCodes.digit9) {
      this.readNumber(true);
      return;
    }

    if (
      next === charCodes.dot &&
      this.input.charCodeAt(this.state.pos + 2) === charCodes.dot
    ) {
      this.state.pos += 3;
      this.finishToken(tt.ellipsis);
    } else {
      ++this.state.pos;
      this.finishToken(tt.dot);
    }
  }

  readToken_slash(): void {
    // '/'
    if (this.state.exprAllowed && !this.state.inType) {
      ++this.state.pos;
      this.readRegexp();
      return;
    }

    const next = this.input.charCodeAt(this.state.pos + 1);
    if (next === charCodes.equalsTo) {
      this.finishOp(tt.assign, 2);
    } else {
      this.finishOp(tt.slash, 1);
    }
  }

  readToken_interpreter(): boolean {
    if (this.state.pos !== 0 || this.length < 2) return false;

    let ch = this.input.charCodeAt(this.state.pos + 1);
    if (ch !== charCodes.exclamationMark) return false;

    const start = this.state.pos;
    this.state.pos += 1;

    while (!isNewLine(ch) && ++this.state.pos < this.length) {
      ch = this.input.charCodeAt(this.state.pos);
    }

    const value = this.input.slice(start + 2, this.state.pos);

    this.finishToken(tt.interpreterDirective, value);

    return true;
  }

  readToken_mult_modulo(code: number): void {
    // '%*'
    let type = code === charCodes.asterisk ? tt.star : tt.modulo;
    let width = 1;
    let next = this.input.charCodeAt(this.state.pos + 1);
    const exprAllowed = this.state.exprAllowed;

    // Exponentiation operator **
    if (code === charCodes.asterisk && next === charCodes.asterisk) {
      width++;
      next = this.input.charCodeAt(this.state.pos + 2);
      type = tt.exponent;
    }

    if (next === charCodes.equalsTo && !exprAllowed) {
      width++;
      type = tt.assign;
    }

    this.finishOp(type, width);
  }

  readToken_pipe_amp(code: number): void {
    // '||' '&&' '||=' '&&='
    const next = this.input.charCodeAt(this.state.pos + 1);

    if (next === code) {
      if (this.input.charCodeAt(this.state.pos + 2) === charCodes.equalsTo) {
        this.finishOp(tt.assign, 3);
      } else {
        this.finishOp(
          code === charCodes.verticalBar ? tt.logicalOR : tt.logicalAND,
          2,
        );
      }
      return;
    }

    if (code === charCodes.verticalBar) {
      // '|>'
      if (next === charCodes.greaterThan) {
        this.finishOp(tt.pipeline, 2);
        return;
      }
      // '|}'
      if (
        this.hasPlugin("recordAndTuple") &&
        next === charCodes.rightCurlyBrace
      ) {
        if (this.getPluginOption("recordAndTuple", "syntaxType") !== "bar") {
          throw this.raise(
            this.state.pos,
            Errors.RecordExpressionBarIncorrectEndSyntaxType,
          );
        }

        this.finishOp(tt.braceBarR, 2);
        return;
      }

      // '|]'
      if (
        this.hasPlugin("recordAndTuple") &&
        next === charCodes.rightSquareBracket
      ) {
        if (this.getPluginOption("recordAndTuple", "syntaxType") !== "bar") {
          throw this.raise(
            this.state.pos,
            Errors.TupleExpressionBarIncorrectEndSyntaxType,
          );
        }

        this.finishOp(tt.bracketBarR, 2);
        return;
      }
    }

    if (next === charCodes.equalsTo) {
      this.finishOp(tt.assign, 2);
      return;
    }

    this.finishOp(
      code === charCodes.verticalBar ? tt.bitwiseOR : tt.bitwiseAND,
      1,
    );
  }

  readToken_caret(): void {
    // '^'
    const next = this.input.charCodeAt(this.state.pos + 1);
    if (next === charCodes.equalsTo) {
      this.finishOp(tt.assign, 2);
    } else {
      this.finishOp(tt.bitwiseXOR, 1);
    }
  }

  readToken_plus_min(code: number): void {
    // '+-'
    const next = this.input.charCodeAt(this.state.pos + 1);

    if (next === code) {
      if (
        next === charCodes.dash &&
        !this.inModule &&
        this.input.charCodeAt(this.state.pos + 2) === charCodes.greaterThan &&
        (this.state.lastTokEnd === 0 ||
          lineBreak.test(
            this.input.slice(this.state.lastTokEnd, this.state.pos),
          ))
      ) {
        // A `-->` line comment
        this.skipLineComment(3);
        this.skipSpace();
        this.nextToken();
        return;
      }
      this.finishOp(tt.incDec, 2);
      return;
    }

    if (next === charCodes.equalsTo) {
      this.finishOp(tt.assign, 2);
    } else {
      this.finishOp(tt.plusMin, 1);
    }
  }

  readToken_lt_gt(code: number): void {
    // '<>'
    const next = this.input.charCodeAt(this.state.pos + 1);
    let size = 1;

    if (next === code) {
      size =
        code === charCodes.greaterThan &&
        this.input.charCodeAt(this.state.pos + 2) === charCodes.greaterThan
          ? 3
          : 2;
      if (this.input.charCodeAt(this.state.pos + size) === charCodes.equalsTo) {
        this.finishOp(tt.assign, size + 1);
        return;
      }
      this.finishOp(tt.bitShift, size);
      return;
    }

    if (
      next === charCodes.exclamationMark &&
      code === charCodes.lessThan &&
      !this.inModule &&
      this.input.charCodeAt(this.state.pos + 2) === charCodes.dash &&
      this.input.charCodeAt(this.state.pos + 3) === charCodes.dash
    ) {
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      this.skipLineComment(4);
      this.skipSpace();
      this.nextToken();
      return;
    }

    if (next === charCodes.equalsTo) {
      // <= | >=
      size = 2;
    }

    this.finishOp(tt.relational, size);
  }

  readToken_eq_excl(code: number): void {
    // '=!'
    const next = this.input.charCodeAt(this.state.pos + 1);
    if (next === charCodes.equalsTo) {
      this.finishOp(
        tt.equality,
        this.input.charCodeAt(this.state.pos + 2) === charCodes.equalsTo
          ? 3
          : 2,
      );
      return;
    }
    if (code === charCodes.equalsTo && next === charCodes.greaterThan) {
      // '=>'
      this.state.pos += 2;
      this.finishToken(tt.arrow);
      return;
    }
    this.finishOp(code === charCodes.equalsTo ? tt.eq : tt.bang, 1);
  }

  readToken_question(): void {
    // '?'
    const next = this.input.charCodeAt(this.state.pos + 1);
    const next2 = this.input.charCodeAt(this.state.pos + 2);
    if (next === charCodes.questionMark && !this.state.inType) {
      if (next2 === charCodes.equalsTo) {
        // '??='
        this.finishOp(tt.assign, 3);
      } else {
        // '??'
        this.finishOp(tt.nullishCoalescing, 2);
      }
    } else if (
      next === charCodes.dot &&
      !(next2 >= charCodes.digit0 && next2 <= charCodes.digit9)
    ) {
      // '.' not followed by a number
      this.state.pos += 2;
      this.finishToken(tt.questionDot);
    } else {
      ++this.state.pos;
      this.finishToken(tt.question);
    }
  }

  readToken_tilde(): void {
    // '~'
    const next = this.input.charCodeAt(this.state.pos + 1);
    if (next === charCodes.dot) {
      // '~.'
      const next2 = this.input.charCodeAt(this.state.pos + 2);
      if (!(next2 >= charCodes.digit0 && next2 <= charCodes.digit9)) {
        // '~.' not followed by a number
        this.state.pos += 2;
        this.finishToken(tt.tildeDot);
        return;
      }
    }
    this.finishOp(tt.tilde, 1);
  }

  getTokenFromCode(code: number): void {
    switch (code) {
      // The interpretation of a dot depends on whether it is followed
      // by a digit or another two dots.

      case charCodes.dot:
        this.readToken_dot();
        return;

      // Punctuation tokens.
      case charCodes.leftParenthesis:
        ++this.state.pos;
        this.finishToken(tt.parenL);
        return;
      case charCodes.rightParenthesis:
        ++this.state.pos;
        this.finishToken(tt.parenR);
        return;
      case charCodes.semicolon:
        ++this.state.pos;
        this.finishToken(tt.semi);
        return;
      case charCodes.comma:
        ++this.state.pos;
        this.finishToken(tt.comma);
        return;
      case charCodes.leftSquareBracket:
        if (
          this.hasPlugin("recordAndTuple") &&
          this.input.charCodeAt(this.state.pos + 1) === charCodes.verticalBar
        ) {
          if (this.getPluginOption("recordAndTuple", "syntaxType") !== "bar") {
            throw this.raise(
              this.state.pos,
              Errors.TupleExpressionBarIncorrectStartSyntaxType,
            );
          }

          // [|
          this.finishToken(tt.bracketBarL);
          this.state.pos += 2;
        } else {
          ++this.state.pos;
          this.finishToken(tt.bracketL);
        }
        return;
      case charCodes.rightSquareBracket:
        ++this.state.pos;
        this.finishToken(tt.bracketR);
        return;
      case charCodes.leftCurlyBrace:
        if (
          this.hasPlugin("recordAndTuple") &&
          this.input.charCodeAt(this.state.pos + 1) === charCodes.verticalBar
        ) {
          if (this.getPluginOption("recordAndTuple", "syntaxType") !== "bar") {
            throw this.raise(
              this.state.pos,
              Errors.RecordExpressionBarIncorrectStartSyntaxType,
            );
          }

          // {|
          this.finishToken(tt.braceBarL);
          this.state.pos += 2;
        } else {
          ++this.state.pos;
          this.finishToken(tt.braceL);
        }
        return;
      case charCodes.rightCurlyBrace:
        ++this.state.pos;
        this.finishToken(tt.braceR);
        return;

      case charCodes.colon:
        if (
          this.hasPlugin("functionBind") &&
          this.input.charCodeAt(this.state.pos + 1) === charCodes.colon
        ) {
          this.finishOp(tt.doubleColon, 2);
        } else {
          ++this.state.pos;
          this.finishToken(tt.colon);
        }
        return;

      case charCodes.questionMark:
        this.readToken_question();
        return;

      case charCodes.graveAccent:
        ++this.state.pos;
        this.finishToken(tt.backQuote);
        return;

      case charCodes.digit0: {
        const next = this.input.charCodeAt(this.state.pos + 1);
        // '0x', '0X' - hex number
        if (next === charCodes.lowercaseX || next === charCodes.uppercaseX) {
          this.readRadixNumber(16);
          return;
        }
        // '0o', '0O' - octal number
        if (next === charCodes.lowercaseO || next === charCodes.uppercaseO) {
          this.readRadixNumber(8);
          return;
        }
        // '0b', '0B' - binary number
        if (next === charCodes.lowercaseB || next === charCodes.uppercaseB) {
          this.readRadixNumber(2);
          return;
        }
      }
      // Anything else beginning with a digit is an integer, octal
      // number, or float. (fall through)
      case charCodes.digit1:
      case charCodes.digit2:
      case charCodes.digit3:
      case charCodes.digit4:
      case charCodes.digit5:
      case charCodes.digit6:
      case charCodes.digit7:
      case charCodes.digit8:
      case charCodes.digit9:
        this.readNumber(false);
        return;

      // Quotes produce strings.
      case charCodes.quotationMark:
      case charCodes.apostrophe:
        this.readString(code);
        return;

      // Operators are parsed inline in tiny state machines. '=' (charCodes.equalsTo) is
      // often referred to. `finishOp` simply skips the amount of
      // characters it is given as second argument, and returns a token
      // of the type given by its first argument.

      case charCodes.slash:
        this.readToken_slash();
        return;

      case charCodes.percentSign:
      case charCodes.asterisk:
        this.readToken_mult_modulo(code);
        return;

      case charCodes.verticalBar:
      case charCodes.ampersand:
        this.readToken_pipe_amp(code);
        return;

      case charCodes.caret:
        this.readToken_caret();
        return;

      case charCodes.plusSign:
      case charCodes.dash:
        this.readToken_plus_min(code);
        return;

      case charCodes.lessThan:
      case charCodes.greaterThan:
        this.readToken_lt_gt(code);
        return;

      case charCodes.equalsTo:
      case charCodes.exclamationMark:
        this.readToken_eq_excl(code);
        return;

      case charCodes.tilde:
        this.readToken_tilde();
        return;

      case charCodes.atSign:
        ++this.state.pos;
        this.finishToken(tt.at);
        return;

      case charCodes.numberSign:
        this.readToken_numberSign();
        return;

      case charCodes.backslash:
        this.readWord();
        return;

      default:
        if (isIdentifierStart(code)) {
          this.readWord();
          return;
        }
    }

    throw this.raise(
      this.state.pos,
      Errors.InvalidOrUnexpectedToken,
      String.fromCodePoint(code),
    );
  }

  finishOp(type: TokenType, size: number): void {
    const str = this.input.slice(this.state.pos, this.state.pos + size);
    this.state.pos += size;
    this.finishToken(type, str);
  }

  readRegexp(): void {
    const start = this.state.pos;
    let escaped, inClass;
    for (;;) {
      if (this.state.pos >= this.length) {
        throw this.raise(start, Errors.UnterminatedRegExp);
      }
      const ch = this.input.charAt(this.state.pos);
      if (lineBreak.test(ch)) {
        throw this.raise(start, Errors.UnterminatedRegExp);
      }
      if (escaped) {
        escaped = false;
      } else {
        if (ch === "[") {
          inClass = true;
        } else if (ch === "]" && inClass) {
          inClass = false;
        } else if (ch === "/" && !inClass) {
          break;
        }
        escaped = ch === "\\";
      }
      ++this.state.pos;
    }
    const content = this.input.slice(start, this.state.pos);
    ++this.state.pos;

    let mods = "";

    while (this.state.pos < this.length) {
      const char = this.input[this.state.pos];
      const charCode = this.input.codePointAt(this.state.pos);

      if (VALID_REGEX_FLAGS.has(char)) {
        if (mods.indexOf(char) > -1) {
          this.raise(this.state.pos + 1, Errors.DuplicateRegExpFlags);
        }
      } else if (
        isIdentifierChar(charCode) ||
        charCode === charCodes.backslash
      ) {
        this.raise(this.state.pos + 1, Errors.MalformedRegExpFlags);
      } else {
        break;
      }

      ++this.state.pos;
      mods += char;
    }

    this.finishToken(tt.regexp, {
      pattern: content,
      flags: mods,
    });
  }

  // Read an integer in the given radix. Return null if zero digits
  // were read, the integer value otherwise. When `len` is given, this
  // will return `null` unless the integer has exactly `len` digits.
  // When `forceLen` is `true`, it means that we already know that in case
  // of a malformed number we have to skip `len` characters anyway, instead
  // of bailing out early. For example, in "\u{123Z}" we want to read up to }
  // anyway, while in "\u00Z" we will stop at Z instead of consuming four
  // characters (and thus the closing quote).

  readInt(
    radix: number,
    len?: number,
    forceLen?: boolean,
    allowNumSeparator: boolean = true,
  ): number | null {
    const start = this.state.pos;
    const forbiddenSiblings =
      radix === 16
        ? forbiddenNumericSeparatorSiblings.hex
        : forbiddenNumericSeparatorSiblings.decBinOct;
    const allowedSiblings =
      radix === 16
        ? allowedNumericSeparatorSiblings.hex
        : radix === 10
        ? allowedNumericSeparatorSiblings.dec
        : radix === 8
        ? allowedNumericSeparatorSiblings.oct
        : allowedNumericSeparatorSiblings.bin;

    let invalid = false;
    let total = 0;

    for (let i = 0, e = len == null ? Infinity : len; i < e; ++i) {
      const code = this.input.charCodeAt(this.state.pos);
      let val;

      if (this.hasPlugin("numericSeparator")) {
        if (code === charCodes.underscore) {
          const prev = this.input.charCodeAt(this.state.pos - 1);
          const next = this.input.charCodeAt(this.state.pos + 1);
          if (allowedSiblings.indexOf(next) === -1) {
            this.raise(this.state.pos, Errors.UnexpectedNumericSeparator);
          } else if (
            forbiddenSiblings.indexOf(prev) > -1 ||
            forbiddenSiblings.indexOf(next) > -1 ||
            Number.isNaN(next)
          ) {
            this.raise(this.state.pos, Errors.UnexpectedNumericSeparator);
          }

          if (!allowNumSeparator) {
            this.raise(this.state.pos, Errors.NumericSeparatorInEscapeSequence);
          }

          // Ignore this _ character
          ++this.state.pos;
          continue;
        }
      }

      if (code >= charCodes.lowercaseA) {
        val = code - charCodes.lowercaseA + charCodes.lineFeed;
      } else if (code >= charCodes.uppercaseA) {
        val = code - charCodes.uppercaseA + charCodes.lineFeed;
      } else if (charCodes.isDigit(code)) {
        val = code - charCodes.digit0; // 0-9
      } else {
        val = Infinity;
      }
      if (val >= radix) {
        // If we are in "errorRecovery" mode and we found a digit which is too big,
        // don't break the loop.

        if (this.options.errorRecovery && val <= 9) {
          val = 0;
          this.raise(this.state.start + i + 2, Errors.InvalidDigit, radix);
        } else if (forceLen) {
          val = 0;
          invalid = true;
        } else {
          break;
        }
      }
      ++this.state.pos;
      total = total * radix + val;
    }
    if (
      this.state.pos === start ||
      (len != null && this.state.pos - start !== len) ||
      invalid
    ) {
      return null;
    }

    return total;
  }

  readRadixNumber(radix: number): void {
    const start = this.state.pos;
    let isBigInt = false;

    this.state.pos += 2; // 0x
    const val = this.readInt(radix);
    if (val == null) {
      this.raise(this.state.start + 2, Errors.InvalidDigit, radix);
    }
    const next = this.input.charCodeAt(this.state.pos);

    if (next === charCodes.underscore) {
      this.expectPlugin("numericSeparator", this.state.pos);
    }

    if (next === charCodes.lowercaseN) {
      ++this.state.pos;
      isBigInt = true;
    }

    if (isIdentifierStart(this.input.codePointAt(this.state.pos))) {
      throw this.raise(this.state.pos, Errors.NumberIdentifier);
    }

    if (isBigInt) {
      const str = this.input.slice(start, this.state.pos).replace(/[_n]/g, "");
      this.finishToken(tt.bigint, str);
      return;
    }

    this.finishToken(tt.num, val);
  }

  // Read an integer, octal integer, or floating-point number.

  readNumber(startsWithDot: boolean): void {
    const start = this.state.pos;
    let isFloat = false;
    let isBigInt = false;
    let isNonOctalDecimalInt = false;

    if (!startsWithDot && this.readInt(10) === null) {
      this.raise(start, Errors.InvalidNumber);
    }
    let octal =
      this.state.pos - start >= 2 &&
      this.input.charCodeAt(start) === charCodes.digit0;
    if (octal) {
      if (this.state.strict) {
        this.raise(start, Errors.StrictOctalLiteral);
      }
      if (/[89]/.test(this.input.slice(start, this.state.pos))) {
        octal = false;
        isNonOctalDecimalInt = true;
      }
    }

    let next = this.input.charCodeAt(this.state.pos);
    if (next === charCodes.dot && !octal) {
      ++this.state.pos;
      this.readInt(10);
      isFloat = true;
      next = this.input.charCodeAt(this.state.pos);
    }

    if (
      (next === charCodes.uppercaseE || next === charCodes.lowercaseE) &&
      !octal
    ) {
      next = this.input.charCodeAt(++this.state.pos);
      if (next === charCodes.plusSign || next === charCodes.dash) {
        ++this.state.pos;
      }
      if (this.readInt(10) === null) this.raise(start, "Invalid number");
      isFloat = true;
      next = this.input.charCodeAt(this.state.pos);
    }

    // disallow numeric separators in non octal decimals and legacy octal likes
    if (this.hasPlugin("numericSeparator") && (octal || isNonOctalDecimalInt)) {
      const underscorePos = this.input
        .slice(start, this.state.pos)
        .indexOf("_");
      if (underscorePos > 0) {
        this.raise(underscorePos + start, Errors.ZeroDigitNumericSeparator);
      }
    }

    if (next === charCodes.underscore) {
      this.expectPlugin("numericSeparator", this.state.pos);
    }

    if (next === charCodes.lowercaseN) {
      // disallow floats, legacy octal syntax and non octal decimals
      // new style octal ("0o") is handled in this.readRadixNumber
      if (isFloat || octal || isNonOctalDecimalInt) {
        this.raise(start, "Invalid BigIntLiteral");
      }
      ++this.state.pos;
      isBigInt = true;
    }

    if (isIdentifierStart(this.input.codePointAt(this.state.pos))) {
      throw this.raise(this.state.pos, Errors.NumberIdentifier);
    }

    // remove "_" for numeric literal separator, and "n" for BigInts
    const str = this.input.slice(start, this.state.pos).replace(/[_n]/g, "");

    if (isBigInt) {
      this.finishToken(tt.bigint, str);
      return;
    }

    const val = octal ? parseInt(str, 8) : parseFloat(str);
    this.finishToken(tt.num, val);
  }

  // Read a string value, interpreting backslash-escapes.

  readCodePoint(throwOnInvalid: boolean): number | null {
    const ch = this.input.charCodeAt(this.state.pos);
    let code;

    if (ch === charCodes.leftCurlyBrace) {
      const codePos = ++this.state.pos;
      code = this.readHexChar(
        this.input.indexOf("}", this.state.pos) - this.state.pos,
        true,
        throwOnInvalid,
      );
      ++this.state.pos;
      if (code !== null && code > 0x10ffff) {
        if (throwOnInvalid) {
          this.raise(codePos, Errors.InvalidCodePoint);
        } else {
          return null;
        }
      }
    } else {
      code = this.readHexChar(4, false, throwOnInvalid);
    }
    return code;
  }

  readString(quote: number): void {
    let out = "",
      chunkStart = ++this.state.pos;
    for (;;) {
      if (this.state.pos >= this.length) {
        throw this.raise(this.state.start, Errors.UnterminatedString);
      }
      const ch = this.input.charCodeAt(this.state.pos);
      if (ch === quote) break;
      if (ch === charCodes.backslash) {
        out += this.input.slice(chunkStart, this.state.pos);
        // $FlowFixMe
        out += this.readEscapedChar(false);
        chunkStart = this.state.pos;
      } else if (
        ch === charCodes.lineSeparator ||
        ch === charCodes.paragraphSeparator
      ) {
        ++this.state.pos;
        ++this.state.curLine;
        this.state.lineStart = this.state.pos;
      } else if (isNewLine(ch)) {
        throw this.raise(this.state.start, Errors.UnterminatedString);
      } else {
        ++this.state.pos;
      }
    }
    out += this.input.slice(chunkStart, this.state.pos++);
    this.finishToken(tt.string, out);
  }

  // Reads template string tokens.

  readTmplToken(): void {
    let out = "",
      chunkStart = this.state.pos,
      containsInvalid = false;
    for (;;) {
      if (this.state.pos >= this.length) {
        throw this.raise(this.state.start, Errors.UnterminatedTemplate);
      }
      const ch = this.input.charCodeAt(this.state.pos);
      if (
        ch === charCodes.graveAccent ||
        (ch === charCodes.dollarSign &&
          this.input.charCodeAt(this.state.pos + 1) ===
            charCodes.leftCurlyBrace)
      ) {
        if (this.state.pos === this.state.start && this.match(tt.template)) {
          if (ch === charCodes.dollarSign) {
            this.state.pos += 2;
            this.finishToken(tt.dollarBraceL);
            return;
          } else {
            ++this.state.pos;
            this.finishToken(tt.backQuote);
            return;
          }
        }
        out += this.input.slice(chunkStart, this.state.pos);
        this.finishToken(tt.template, containsInvalid ? null : out);
        return;
      }
      if (ch === charCodes.backslash) {
        out += this.input.slice(chunkStart, this.state.pos);
        const escaped = this.readEscapedChar(true);
        if (escaped === null) {
          containsInvalid = true;
        } else {
          out += escaped;
        }
        chunkStart = this.state.pos;
      } else if (isNewLine(ch)) {
        out += this.input.slice(chunkStart, this.state.pos);
        ++this.state.pos;
        switch (ch) {
          case charCodes.carriageReturn:
            if (this.input.charCodeAt(this.state.pos) === charCodes.lineFeed) {
              ++this.state.pos;
            }
          // fall through
          case charCodes.lineFeed:
            out += "\n";
            break;
          default:
            out += String.fromCharCode(ch);
            break;
        }
        ++this.state.curLine;
        this.state.lineStart = this.state.pos;
        chunkStart = this.state.pos;
      } else {
        ++this.state.pos;
      }
    }
  }

  // Used to read escaped characters

  readEscapedChar(inTemplate: boolean): string | null {
    const throwOnInvalid = !inTemplate;
    const ch = this.input.charCodeAt(++this.state.pos);
    ++this.state.pos;
    switch (ch) {
      case charCodes.lowercaseN:
        return "\n";
      case charCodes.lowercaseR:
        return "\r";
      case charCodes.lowercaseX: {
        const code = this.readHexChar(2, false, throwOnInvalid);
        return code === null ? null : String.fromCharCode(code);
      }
      case charCodes.lowercaseU: {
        const code = this.readCodePoint(throwOnInvalid);
        return code === null ? null : String.fromCodePoint(code);
      }
      case charCodes.lowercaseT:
        return "\t";
      case charCodes.lowercaseB:
        return "\b";
      case charCodes.lowercaseV:
        return "\u000b";
      case charCodes.lowercaseF:
        return "\f";
      case charCodes.carriageReturn:
        if (this.input.charCodeAt(this.state.pos) === charCodes.lineFeed) {
          ++this.state.pos;
        }
      // fall through
      case charCodes.lineFeed:
        this.state.lineStart = this.state.pos;
        ++this.state.curLine;
      // fall through
      case charCodes.lineSeparator:
      case charCodes.paragraphSeparator:
        return "";
      case charCodes.digit8:
      case charCodes.digit9:
        if (inTemplate) {
          return null;
        }
      // fall through
      default:
        if (ch >= charCodes.digit0 && ch <= charCodes.digit7) {
          const codePos = this.state.pos - 1;
          const match = this.input
            .substr(this.state.pos - 1, 3)
            .match(/^[0-7]+/);

          // This is never null, because of the if condition above.
          /*:: invariant(match !== null) */
          let octalStr = match[0];

          let octal = parseInt(octalStr, 8);
          if (octal > 255) {
            octalStr = octalStr.slice(0, -1);
            octal = parseInt(octalStr, 8);
          }
          this.state.pos += octalStr.length - 1;
          const next = this.input.charCodeAt(this.state.pos);
          if (
            octalStr !== "0" ||
            next === charCodes.digit8 ||
            next === charCodes.digit9
          ) {
            if (inTemplate) {
              return null;
            } else if (this.state.strict) {
              this.raise(codePos, Errors.StrictOctalLiteral);
            } else {
              // This property is used to throw an error for
              // an octal literal in a directive that occurs prior
              // to a "use strict" directive.
              this.state.octalPositions.push(codePos);
            }
          }

          return String.fromCharCode(octal);
        }

        return String.fromCharCode(ch);
    }
  }

  // Used to read character escape sequences ('\x', '\u').

  readHexChar(
    len: number,
    forceLen: boolean,
    throwOnInvalid: boolean,
  ): number | null {
    const codePos = this.state.pos;
    const n = this.readInt(16, len, forceLen, false);
    if (n === null) {
      if (throwOnInvalid) {
        this.raise(codePos, Errors.InvalidEscapeSequence);
      } else {
        this.state.pos = codePos - 1;
      }
    }
    return n;
  }

  // Read an identifier, and return it as a string. Sets `this.state.containsEsc`
  // to whether the word contained a '\u' escape.
  //
  // Incrementally adds only escaped chars, adding other chunks as-is
  // as a micro-optimization.

  readWord1(): string {
    let word = "";
    this.state.containsEsc = false;
    const start = this.state.pos;
    let chunkStart = this.state.pos;

    while (this.state.pos < this.length) {
      const ch = this.input.codePointAt(this.state.pos);
      if (isIdentifierChar(ch)) {
        this.state.pos += ch <= 0xffff ? 1 : 2;
      } else if (this.state.isIterator && ch === charCodes.atSign) {
        ++this.state.pos;
      } else if (ch === charCodes.backslash) {
        this.state.containsEsc = true;

        word += this.input.slice(chunkStart, this.state.pos);
        const escStart = this.state.pos;
        const identifierCheck =
          this.state.pos === start ? isIdentifierStart : isIdentifierChar;

        if (this.input.charCodeAt(++this.state.pos) !== charCodes.lowercaseU) {
          this.raise(this.state.pos, Errors.MissingUnicodeEscape);
          continue;
        }

        ++this.state.pos;
        const esc = this.readCodePoint(true);
        if (esc !== null) {
          if (!identifierCheck(esc)) {
            this.raise(escStart, Errors.EscapedCharNotAnIdentifier);
          }

          word += String.fromCodePoint(esc);
        }
        chunkStart = this.state.pos;
      } else {
        break;
      }
    }
    return word + this.input.slice(chunkStart, this.state.pos);
  }

  isIterator(word: string): boolean {
    return word === "@@iterator" || word === "@@asyncIterator";
  }

  // Read an identifier or keyword token. Will check for reserved
  // words when necessary.

  readWord(): void {
    const word = this.readWord1();
    const type = keywordTypes.get(word) || tt.name;

    // Allow @@iterator and @@asyncIterator as a identifier only inside type
    if (
      this.state.isIterator &&
      (!this.isIterator(word) || !this.state.inType)
    ) {
      this.raise(this.state.pos, Errors.InvalidIdentifier, word);
    }

    this.finishToken(type, word);
  }

  checkKeywordEscapes(): void {
    const kw = this.state.type.keyword;
    if (kw && this.state.containsEsc) {
      this.raise(this.state.start, Errors.InvalidEscapedReservedWord, kw);
    }
  }

  braceIsBlock(prevType: TokenType): boolean {
    const parent = this.curContext();
    if (parent === ct.functionExpression || parent === ct.functionStatement) {
      return true;
    }
    if (
      prevType === tt.colon &&
      (parent === ct.braceStatement || parent === ct.braceExpression)
    ) {
      return !parent.isExpr;
    }

    // The check for `tt.name && exprAllowed` detects whether we are
    // after a `yield` or `of` construct. See the `updateContext` for
    // `tt.name`.
    if (
      prevType === tt._return ||
      (prevType === tt.name && this.state.exprAllowed)
    ) {
      return lineBreak.test(
        this.input.slice(this.state.lastTokEnd, this.state.start),
      );
    }

    if (
      prevType === tt._else ||
      prevType === tt.semi ||
      prevType === tt.eof ||
      prevType === tt.parenR ||
      prevType === tt.arrow
    ) {
      return true;
    }

    if (prevType === tt.braceL) {
      return parent === ct.braceStatement;
    }

    if (
      prevType === tt._var ||
      prevType === tt._const ||
      prevType === tt.name
    ) {
      return false;
    }

    if (prevType === tt.relational) {
      // `class C<T> { ... }`
      return true;
    }

    return !this.state.exprAllowed;
  }

  updateContext(prevType: TokenType): void {
    const type = this.state.type;
    let update;

    if (type.keyword && (prevType === tt.dot || prevType === tt.questionDot)) {
      this.state.exprAllowed = false;
    } else if ((update = type.updateContext)) {
      update.call(this, prevType);
    } else {
      this.state.exprAllowed = type.beforeExpr;
    }
  }
}
