// @flow

import { types as tt, TokenType } from "../tokenizer/types";
import Tokenizer from "../tokenizer";
import State from "../tokenizer/state";
import type { Node } from "../types";
import { lineBreak } from "../util/whitespace";
import { isIdentifierChar } from "../util/identifier";
import ClassScopeHandler from "../util/class-scope";
import ExpressionScopeHandler from "../util/expression-scope";
import { SCOPE_PROGRAM } from "../util/scopeflags";
import ProductionParameterHandler, {
  PARAM_AWAIT,
  PARAM,
} from "../util/production-parameter";
import { Errors, type ErrorTemplate, ErrorCodes } from "./error";
import type { ParsingError } from "./error";
/*::
import type ScopeHandler from "../util/scope";
*/

type TryParse<Node, Error, Thrown, Aborted, FailState> = {
  node: Node,
  error: Error,
  thrown: Thrown,
  aborted: Aborted,
  failState: FailState,
};

// ## Parser utilities

export default class UtilParser extends Tokenizer {
  // Forward-declaration: defined in parser/index.js
  /*::
  +getScopeHandler: () => Class<ScopeHandler<*>>;
  */

  // TODO

  addExtra(node: Node, key: string, val: any): void {
    if (!node) return;

    const extra = (node.extra = node.extra || {});
    extra[key] = val;
  }

  // TODO

  isRelational(op: "<" | ">"): boolean {
    return this.match(tt.relational) && this.state.value === op;
  }

  // TODO

  expectRelational(op: "<" | ">"): void {
    if (this.isRelational(op)) {
      this.next();
    } else {
      this.unexpected(null, tt.relational);
    }
  }

  // Tests whether parsed token is a contextual keyword.

  isContextual(name: string): boolean {
    return (
      this.match(tt.name) &&
      this.state.value === name &&
      !this.state.containsEsc
    );
  }

  isUnparsedContextual(nameStart: number, name: string): boolean {
    const nameEnd = nameStart + name.length;
    if (this.input.slice(nameStart, nameEnd) === name) {
      const nextCh = this.input.charCodeAt(nameEnd);
      return !(
        isIdentifierChar(nextCh) ||
        // check if `nextCh is between 0xd800 - 0xdbff,
        // if `nextCh` is NaN, `NaN & 0xfc00` is 0, the function
        // returns true
        (nextCh & 0xfc00) === 0xd800
      );
    }
    return false;
  }

  isLookaheadContextual(name: string): boolean {
    const next = this.nextTokenStart();
    return this.isUnparsedContextual(next, name);
  }

  // Consumes contextual keyword if possible.

  eatContextual(name: string): boolean {
    return this.isContextual(name) && this.eat(tt.name);
  }

  // Asserts that following token is given contextual keyword.

  expectContextual(name: string, template?: ErrorTemplate): void {
    if (!this.eatContextual(name)) this.unexpected(null, template);
  }

  // Test whether a semicolon can be inserted at the current position.

  canInsertSemicolon(): boolean {
    return (
      this.match(tt.eof) ||
      this.match(tt.braceR) ||
      this.hasPrecedingLineBreak()
    );
  }

  hasPrecedingLineBreak(): boolean {
    return lineBreak.test(
      this.input.slice(this.state.lastTokEnd, this.state.start),
    );
  }

  hasFollowingLineBreak(): boolean {
    return lineBreak.test(
      this.input.slice(this.state.end, this.nextTokenStart()),
    );
  }

  // TODO

  isLineTerminator(): boolean {
    return this.eat(tt.semi) || this.canInsertSemicolon();
  }

  // Consume a semicolon, or, failing that, see if we are allowed to
  // pretend that there is a semicolon at this position.

  semicolon(allowAsi: boolean = true): void {
    if (allowAsi ? this.isLineTerminator() : this.eat(tt.semi)) return;
    this.raise(this.state.lastTokEnd, Errors.MissingSemicolon);
  }

  // Expect a token of a given type. If found, consume it, otherwise,
  // raise an unexpected token error at given pos.

  expect(type: TokenType, pos?: ?number): void {
    this.eat(type) || this.unexpected(pos, type);
  }

  // Throws if the current token and the prev one are separated by a space.
  assertNoSpace(message: string = "Unexpected space."): void {
    if (this.state.start > this.state.lastTokEnd) {
      /* eslint-disable @babel/development-internal/dry-error-messages */
      this.raise(this.state.lastTokEnd, {
        code: ErrorCodes.SyntaxError,
        reasonCode: "UnexpectedSpace",
        template: message,
      });
      /* eslint-enable @babel/development-internal/dry-error-messages */
    }
  }

  // Raise an unexpected token error. Can take the expected token type
  // instead of a message string.

  unexpected(
    pos: ?number,
    messageOrType: ErrorTemplate | TokenType = {
      code: ErrorCodes.SyntaxError,
      reasonCode: "UnexpectedToken",
      template: "Unexpected token",
    },
  ): empty {
    if (messageOrType instanceof TokenType) {
      messageOrType = {
        code: ErrorCodes.SyntaxError,
        reasonCode: "UnexpectedToken",
        template: `Unexpected token, expected "${messageOrType.label}"`,
      };
    }

    /* eslint-disable @babel/development-internal/dry-error-messages */
    throw this.raise(pos != null ? pos : this.state.start, messageOrType);
    /* eslint-enable @babel/development-internal/dry-error-messages */
  }

  expectPlugin(name: string, pos?: ?number): true {
    if (!this.hasPlugin(name)) {
      throw this.raiseWithData(
        pos != null ? pos : this.state.start,
        { missingPlugin: [name] },
        `This experimental syntax requires enabling the parser plugin: '${name}'`,
      );
    }

    return true;
  }

  expectOnePlugin(names: Array<string>, pos?: ?number): void {
    if (!names.some(n => this.hasPlugin(n))) {
      throw this.raiseWithData(
        pos != null ? pos : this.state.start,
        { missingPlugin: names },
        `This experimental syntax requires enabling one of the following parser plugin(s): '${names.join(
          ", ",
        )}'`,
      );
    }
  }

  // tryParse will clone parser state.
  // It is expensive and should be used with cautions
  tryParse<T: Node | $ReadOnlyArray<Node>>(
    fn: (abort: (node?: T) => empty) => T,
    oldState: State = this.state.clone(),
  ):
    | TryParse<T, null, false, false, null>
    | TryParse<T | null, ParsingError, boolean, false, State>
    | TryParse<T | null, null, false, true, State> {
    const abortSignal: { node: T | null } = { node: null };
    try {
      const node = fn((node = null) => {
        abortSignal.node = node;
        throw abortSignal;
      });
      if (this.state.errors.length > oldState.errors.length) {
        const failState = this.state;
        this.state = oldState;
        // tokensLength should be preserved during error recovery mode
        // since the parser does not halt and will instead parse the
        // remaining tokens
        this.state.tokensLength = failState.tokensLength;
        return {
          node,
          error: (failState.errors[oldState.errors.length]: ParsingError),
          thrown: false,
          aborted: false,
          failState,
        };
      }

      return {
        node,
        error: null,
        thrown: false,
        aborted: false,
        failState: null,
      };
    } catch (error) {
      const failState = this.state;
      this.state = oldState;
      if (error instanceof SyntaxError) {
        return { node: null, error, thrown: true, aborted: false, failState };
      }
      if (error === abortSignal) {
        return {
          node: abortSignal.node,
          error: null,
          thrown: false,
          aborted: true,
          failState,
        };
      }

      throw error;
    }
  }

  checkExpressionErrors(
    refExpressionErrors: ?ExpressionErrors,
    andThrow: boolean,
  ) {
    if (!refExpressionErrors) return false;
    const { shorthandAssign, doubleProto, optionalParameters } =
      refExpressionErrors;
    if (!andThrow) {
      return (
        shorthandAssign >= 0 || doubleProto >= 0 || optionalParameters >= 0
      );
    }
    if (shorthandAssign >= 0) {
      this.unexpected(shorthandAssign);
    }
    if (doubleProto >= 0) {
      this.raise(doubleProto, Errors.DuplicateProto);
    }
    if (optionalParameters >= 0) {
      this.unexpected(optionalParameters);
    }
  }

  /**
   * Test if current token is a literal property name
   * https://tc39.es/ecma262/#prod-LiteralPropertyName
   * LiteralPropertyName:
   *   IdentifierName
   *   StringLiteral
   *   NumericLiteral
   *   BigIntLiteral
   */
  isLiteralPropertyName(): boolean {
    return (
      this.match(tt.name) ||
      !!this.state.type.keyword ||
      this.match(tt.string) ||
      this.match(tt.num) ||
      this.match(tt.bigint) ||
      this.match(tt.decimal)
    );
  }

  /*
   * Test if given node is a PrivateName
   * will be overridden in ESTree plugin
   */
  isPrivateName(node: Node): boolean {
    return node.type === "PrivateName";
  }

  /*
   * Return the string value of a given private name
   * WITHOUT `#`
   * @see {@link https://tc39.es/proposal-class-fields/#sec-private-names-static-semantics-stringvalue}
   */
  getPrivateNameSV(node: Node): string {
    return node.id.name;
  }

  /*
   * Return whether the given node is a member/optional chain that
   * contains a private name as its property
   * It is overridden in ESTree plugin
   */
  hasPropertyAsPrivateName(node: Node): boolean {
    return (
      (node.type === "MemberExpression" ||
        node.type === "OptionalMemberExpression") &&
      this.isPrivateName(node.property)
    );
  }

  isOptionalChain(node: Node): boolean {
    return (
      node.type === "OptionalMemberExpression" ||
      node.type === "OptionalCallExpression"
    );
  }

  isObjectProperty(node: Node): boolean {
    return node.type === "ObjectProperty";
  }

  isObjectMethod(node: Node): boolean {
    return node.type === "ObjectMethod";
  }

  initializeScopes(
    inModule: boolean = this.options.sourceType === "module",
  ): () => void {
    // Initialize state
    const oldLabels = this.state.labels;
    this.state.labels = [];

    const oldExportedIdentifiers = this.exportedIdentifiers;
    this.exportedIdentifiers = new Set();

    // initialize scopes
    const oldInModule = this.inModule;
    this.inModule = inModule;

    const oldScope = this.scope;
    const ScopeHandler = this.getScopeHandler();
    this.scope = new ScopeHandler(this.raise.bind(this), this.inModule);

    const oldProdParam = this.prodParam;
    this.prodParam = new ProductionParameterHandler();

    const oldClassScope = this.classScope;
    this.classScope = new ClassScopeHandler(this.raise.bind(this));

    const oldExpressionScope = this.expressionScope;
    this.expressionScope = new ExpressionScopeHandler(this.raise.bind(this));

    return () => {
      // Revert state
      this.state.labels = oldLabels;
      this.exportedIdentifiers = oldExportedIdentifiers;

      // Revert scopes
      this.inModule = oldInModule;
      this.scope = oldScope;
      this.prodParam = oldProdParam;
      this.classScope = oldClassScope;
      this.expressionScope = oldExpressionScope;
    };
  }

  enterInitialScopes() {
    let paramFlags = PARAM;
    if (this.inModule) {
      paramFlags |= PARAM_AWAIT;
    }
    this.scope.enter(SCOPE_PROGRAM);
    this.prodParam.enter(paramFlags);
  }
}

/**
 * The ExpressionErrors is a context struct used to track ambiguous patterns
 * When we are sure the parsed pattern is a RHS, which means it is not a pattern,
 * we will throw on this position on invalid assign syntax, otherwise it will be reset to -1
 *
 * Types of ExpressionErrors:
 *
 * - **shorthandAssign**: track initializer `=` position
 * - **doubleProto**: track the duplicate `__proto__` key position
 * - **optionalParameters**: track the optional paramter (`?`).
 * It's only used by typescript and flow plugins
 */
export class ExpressionErrors {
  shorthandAssign = -1;
  doubleProto = -1;
  optionalParameters = -1;
}
