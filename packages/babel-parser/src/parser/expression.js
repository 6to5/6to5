// @flow

// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

import { types as tt, type TokenType } from "../tokenizer/types";
import { types as ct } from "../tokenizer/context";
import * as N from "../types";
import LValParser from "./lval";
import {
  isKeyword,
  isReservedWord,
  isStrictReservedWord,
  isStrictBindReservedWord,
  isIdentifierStart,
} from "../util/identifier";
import type { Pos, Position } from "../util/location";
import * as charCodes from "charcodes";
import {
  BIND_OUTSIDE,
  BIND_VAR,
  SCOPE_ARROW,
  SCOPE_CLASS,
  SCOPE_DIRECT_SUPER,
  SCOPE_FUNCTION,
  SCOPE_SUPER,
  SCOPE_PROGRAM,
} from "../util/scopeflags";
import { ExpressionErrors } from "./util";
import {
  PARAM_AWAIT,
  PARAM_RETURN,
  PARAM,
  functionFlags,
} from "../util/production-parameter";
import { Errors } from "./error";

export default class ExpressionParser extends LValParser {
  // Forward-declaration: defined in statement.js
  /*::
  +parseBlock: (
    allowDirectives?: boolean,
    createNewLexicalScope?: boolean,
    afterBlockParse?: (hasStrictModeDirective: boolean) => void,
  ) => N.BlockStatement;
  +parseClass: (
    node: N.Class,
    isStatement: boolean,
    optionalId?: boolean,
  ) => N.Class;
  +parseDecorators: (allowExport?: boolean) => void;
  +parseFunction: <T: N.NormalFunction>(
    node: T,
    statement?: number,
    allowExpressionBody?: boolean,
    isAsync?: boolean,
  ) => T;
  +parseFunctionParams: (node: N.Function, allowModifiers?: boolean) => void;
  +takeDecorators: (node: N.HasDecorators) => void;
  */

  // Check if property __proto__ has been used more than once.
  // If the expression is a destructuring assignment, then __proto__ may appear
  // multiple times. Otherwise, __proto__ is a duplicated key.

  checkDuplicatedProto(
    prop: N.ObjectMember | N.SpreadElement,
    protoRef: { used: boolean },
    refExpressionErrors: ?ExpressionErrors,
  ): void {
    if (
      prop.type === "SpreadElement" ||
      prop.computed ||
      prop.kind ||
      // $FlowIgnore
      prop.shorthand
    ) {
      return;
    }

    const key = prop.key;
    // It is either an Identifier or a String/NumericLiteral
    const name = key.type === "Identifier" ? key.name : String(key.value);

    if (name === "__proto__") {
      if (protoRef.used) {
        if (refExpressionErrors) {
          // Store the first redefinition's position, otherwise ignore because
          // we are parsing ambiguous pattern
          if (refExpressionErrors.doubleProto === -1) {
            refExpressionErrors.doubleProto = key.start;
          }
        } else {
          this.raise(key.start, Errors.DuplicateProto);
        }
      }

      protoRef.used = true;
    }
  }

  // Convenience method to parse an Expression only
  getExpression(): N.Expression {
    let paramFlags = PARAM;
    if (this.hasPlugin("topLevelAwait") && this.inModule) {
      paramFlags |= PARAM_AWAIT;
    }
    this.scope.enter(SCOPE_PROGRAM);
    this.prodParam.enter(paramFlags);
    this.nextToken();
    const expr = this.parseExpression();
    if (!this.match(tt.eof)) {
      this.unexpected();
    }
    expr.comments = this.state.comments;
    expr.errors = this.state.errors;
    return expr;
  }

  // ### Expression parsing

  // These nest, from the most general expression type at the top to
  // 'atomic', nondivisible expression types at the bottom. Most of
  // the functions will simply let the function (s) below them parse,
  // and, *if* the syntactic construct they handle is present, wrap
  // the AST node that the inner parser gave them in another node.

  // Parse a full expression.
  // - `noIn`
  //   is used to forbid the `in` operator (in for loops initialization expressions)
  //   When `noIn` is true, the production parameter [In] is not present.
  //   Whenever [?In] appears in the right-hand sides of a production, we pass
  //   `noIn` to the subroutine calls.

  // - `refExpressionErrors `
  //   provides reference for storing '=' operator inside shorthand
  //   property assignment in contexts where both object expression
  //   and object pattern might appear (so it's possible to raise
  //   delayed syntax error at correct position).

  parseExpression(
    noIn?: boolean,
    refExpressionErrors?: ExpressionErrors,
  ): N.Expression {
    const startPos = this.state.start;
    const startLoc = this.state.startLoc;
    const expr = this.parseMaybeAssign(noIn, refExpressionErrors);
    if (this.match(tt.comma)) {
      const node = this.startNodeAt(startPos, startLoc);
      node.expressions = [expr];
      while (this.eat(tt.comma)) {
        node.expressions.push(this.parseMaybeAssign(noIn, refExpressionErrors));
      }
      this.toReferencedList(node.expressions);
      return this.finishNode(node, "SequenceExpression");
    }
    return expr;
  }

  // Parse an assignment expression. This includes applications of
  // operators like `+=`.

  parseMaybeAssign(
    noIn?: ?boolean,
    refExpressionErrors?: ?ExpressionErrors,
    afterLeftParse?: Function,
    refNeedsArrowPos?: ?Pos,
  ): N.Expression {
    const startPos = this.state.start;
    const startLoc = this.state.startLoc;
    if (this.isContextual("yield")) {
      if (this.prodParam.hasYield) {
        let left = this.parseYield(noIn);
        if (afterLeftParse) {
          left = afterLeftParse.call(this, left, startPos, startLoc);
        }
        return left;
      } else {
        // The tokenizer will assume an expression is allowed after
        // `yield`, but this isn't that kind of yield
        this.state.exprAllowed = false;
      }
    }

    let ownExpressionErrors;
    if (refExpressionErrors) {
      ownExpressionErrors = false;
    } else {
      refExpressionErrors = new ExpressionErrors();
      ownExpressionErrors = true;
    }

    if (this.match(tt.parenL) || this.match(tt.name)) {
      this.state.potentialArrowAt = this.state.start;
    }

    let left = this.parseMaybeConditional(
      noIn,
      refExpressionErrors,
      refNeedsArrowPos,
    );
    if (afterLeftParse) {
      left = afterLeftParse.call(this, left, startPos, startLoc);
    }
    if (this.state.type.isAssign) {
      const node = this.startNodeAt(startPos, startLoc);
      const operator = this.state.value;
      node.operator = operator;

      if (operator === "??=") {
        this.expectPlugin("logicalAssignment");
      }
      if (operator === "||=" || operator === "&&=") {
        this.expectPlugin("logicalAssignment");
      }
      if (this.match(tt.eq)) {
        node.left = this.toAssignable(left);
        refExpressionErrors.doubleProto = -1; // reset because double __proto__ is valid in assignment expression
      } else {
        node.left = left;
      }

      if (refExpressionErrors.shorthandAssign >= node.left.start) {
        refExpressionErrors.shorthandAssign = -1; // reset because shorthand default was used correctly
      }

      this.checkLVal(left, undefined, undefined, "assignment expression");

      this.next();
      node.right = this.parseMaybeAssign(noIn);
      return this.finishNode(node, "AssignmentExpression");
    } else if (ownExpressionErrors) {
      this.checkExpressionErrors(refExpressionErrors, true);
    }

    return left;
  }

  // Parse a ternary conditional (`?:`) operator.

  parseMaybeConditional(
    noIn: ?boolean,
    refExpressionErrors: ExpressionErrors,
    refNeedsArrowPos?: ?Pos,
  ): N.Expression {
    const startPos = this.state.start;
    const startLoc = this.state.startLoc;
    const potentialArrowAt = this.state.potentialArrowAt;
    const expr = this.parseExprOps(noIn, refExpressionErrors);

    if (
      expr.type === "ArrowFunctionExpression" &&
      expr.start === potentialArrowAt
    ) {
      return expr;
    }
    if (this.checkExpressionErrors(refExpressionErrors, false)) return expr;

    return this.parseConditional(
      expr,
      noIn,
      startPos,
      startLoc,
      refNeedsArrowPos,
    );
  }

  parseConditional(
    expr: N.Expression,
    noIn: ?boolean,
    startPos: number,
    startLoc: Position,
    // FIXME: Disabling this for now since can't seem to get it to play nicely
    // eslint-disable-next-line no-unused-vars
    refNeedsArrowPos?: ?Pos,
  ): N.Expression {
    if (this.eat(tt.question)) {
      const node = this.startNodeAt(startPos, startLoc);
      node.test = expr;
      node.consequent = this.parseMaybeAssign();
      this.expect(tt.colon);
      node.alternate = this.parseMaybeAssign(noIn);
      return this.finishNode(node, "ConditionalExpression");
    }
    return expr;
  }

  // Start the precedence parser.

  parseExprOps(
    noIn: ?boolean,
    refExpressionErrors: ExpressionErrors,
  ): N.Expression {
    const startPos = this.state.start;
    const startLoc = this.state.startLoc;
    const potentialArrowAt = this.state.potentialArrowAt;
    const expr = this.parseMaybeUnary(refExpressionErrors);

    if (
      expr.type === "ArrowFunctionExpression" &&
      expr.start === potentialArrowAt
    ) {
      return expr;
    }
    if (this.checkExpressionErrors(refExpressionErrors, false)) {
      return expr;
    }

    return this.parseExprOp(expr, startPos, startLoc, -1, noIn);
  }

  // Parse binary operators with the operator precedence parsing
  // algorithm. `left` is the left-hand side of the operator.
  // `minPrec` provides context that allows the function to stop and
  // defer further parser to one of its callers when it encounters an
  // operator that has a lower precedence than the set it is parsing.

  parseExprOp(
    left: N.Expression,
    leftStartPos: number,
    leftStartLoc: Position,
    minPrec: number,
    noIn: ?boolean,
  ): N.Expression {
    let prec = this.state.type.binop;
    if (prec != null && (!noIn || !this.match(tt._in))) {
      if (prec > minPrec) {
        const operator = this.state.value;
        if (operator === "|>" && this.state.inFSharpPipelineDirectBody) {
          return left;
        }
        const node = this.startNodeAt(leftStartPos, leftStartLoc);
        node.left = left;
        node.operator = operator;
        if (
          operator === "**" &&
          left.type === "UnaryExpression" &&
          (this.options.createParenthesizedExpressions ||
            !(left.extra && left.extra.parenthesized))
        ) {
          this.raise(
            left.argument.start,
            Errors.UnexpectedTokenUnaryExponentiation,
          );
        }

        const op = this.state.type;
        const logical = op === tt.logicalOR || op === tt.logicalAND;
        const coalesce = op === tt.nullishCoalescing;

        if (op === tt.pipeline) {
          this.expectPlugin("pipelineOperator");
          this.state.inPipeline = true;
          this.checkPipelineAtInfixOperator(left, leftStartPos);
        } else if (coalesce) {
          // Handle the precedence of `tt.coalesce` as equal to the range of logical expressions.
          // In other words, `node.right` shouldn't contain logical expressions in order to check the mixed error.
          prec = ((tt.logicalAND: any): { binop: number }).binop;
        }

        this.next();

        if (
          op === tt.pipeline &&
          this.getPluginOption("pipelineOperator", "proposal") === "minimal"
        ) {
          if (
            this.match(tt.name) &&
            this.state.value === "await" &&
            this.prodParam.hasAwait
          ) {
            throw this.raise(
              this.state.start,
              Errors.UnexpectedAwaitAfterPipelineBody,
            );
          }
        }

        node.right = this.parseExprOpRightExpr(op, prec, noIn);
        this.finishNode(
          node,
          logical || coalesce ? "LogicalExpression" : "BinaryExpression",
        );
        /* this check is for all ?? operators
         * a ?? b && c for this example
         * when op is coalesce and nextOp is logical (&&), throw at the pos of nextOp that it can not be mixed.
         * Symmetrically it also throws when op is logical and nextOp is coalesce
         */
        const nextOp = this.state.type;
        if (
          (coalesce && (nextOp === tt.logicalOR || nextOp === tt.logicalAND)) ||
          (logical && nextOp === tt.nullishCoalescing)
        ) {
          throw this.raise(this.state.start, Errors.MixingCoalesceWithLogical);
        }

        return this.parseExprOp(
          node,
          leftStartPos,
          leftStartLoc,
          minPrec,
          noIn,
        );
      }
    }
    return left;
  }

  // Helper function for `parseExprOp`. Parse the right-hand side of binary-
  // operator expressions, then apply any operator-specific functions.

  parseExprOpRightExpr(
    op: TokenType,
    prec: number,
    noIn: ?boolean,
  ): N.Expression {
    const startPos = this.state.start;
    const startLoc = this.state.startLoc;
    switch (op) {
      case tt.pipeline:
        switch (this.getPluginOption("pipelineOperator", "proposal")) {
          case "smart":
            return this.withTopicPermittingContext(() => {
              return this.parseSmartPipelineBody(
                this.parseExprOpBaseRightExpr(op, prec, noIn),
                startPos,
                startLoc,
              );
            });
          case "fsharp":
            return this.withSoloAwaitPermittingContext(() => {
              return this.parseFSharpPipelineBody(prec, noIn);
            });
        }
      // falls through

      default:
        return this.parseExprOpBaseRightExpr(op, prec, noIn);
    }
  }

  // Helper function for `parseExprOpRightExpr`. Parse the right-hand side of
  // binary-operator expressions without applying any operator-specific functions.

  parseExprOpBaseRightExpr(
    op: TokenType,
    prec: number,
    noIn: ?boolean,
  ): N.Expression {
    const startPos = this.state.start;
    const startLoc = this.state.startLoc;

    return this.parseExprOp(
      this.parseMaybeUnary(),
      startPos,
      startLoc,
      op.rightAssociative ? prec - 1 : prec,
      noIn,
    );
  }

  // Parse unary operators, both prefix and postfix.

  parseMaybeUnary(refExpressionErrors: ?ExpressionErrors): N.Expression {
    if (this.isContextual("await") && this.isAwaitAllowed()) {
      return this.parseAwait();
    } else if (this.state.type.prefix) {
      const node = this.startNode();
      const update = this.match(tt.incDec);
      node.operator = this.state.value;
      node.prefix = true;

      if (node.operator === "throw") {
        this.expectPlugin("throwExpressions");
      }
      this.next();

      node.argument = this.parseMaybeUnary();

      this.checkExpressionErrors(refExpressionErrors, true);

      if (update) {
        this.checkLVal(node.argument, undefined, undefined, "prefix operation");
      } else if (this.state.strict && node.operator === "delete") {
        const arg = node.argument;

        if (arg.type === "Identifier") {
          this.raise(node.start, Errors.StrictDelete);
        } else if (
          (arg.type === "MemberExpression" ||
            arg.type === "OptionalMemberExpression") &&
          arg.property.type === "PrivateName"
        ) {
          this.raise(node.start, Errors.DeletePrivateField);
        }
      }

      return this.finishNode(
        node,
        update ? "UpdateExpression" : "UnaryExpression",
      );
    }

    const startPos = this.state.start;
    const startLoc = this.state.startLoc;
    let expr = this.parseExprSubscripts(refExpressionErrors);
    if (this.checkExpressionErrors(refExpressionErrors, false)) return expr;
    while (this.state.type.postfix && !this.canInsertSemicolon()) {
      const node = this.startNodeAt(startPos, startLoc);
      node.operator = this.state.value;
      node.prefix = false;
      node.argument = expr;
      this.checkLVal(expr, undefined, undefined, "postfix operation");
      this.next();
      expr = this.finishNode(node, "UpdateExpression");
    }
    return expr;
  }

  // Parse call, dot, and `[]`-subscript expressions.

  parseExprSubscripts(refExpressionErrors: ?ExpressionErrors): N.Expression {
    const startPos = this.state.start;
    const startLoc = this.state.startLoc;
    const potentialArrowAt = this.state.potentialArrowAt;
    const expr = this.parseExprAtom(refExpressionErrors);

    if (
      expr.type === "ArrowFunctionExpression" &&
      expr.start === potentialArrowAt
    ) {
      return expr;
    }

    return this.parseSubscripts(expr, startPos, startLoc);
  }

  parseSubscripts(
    base: N.Expression,
    startPos: number,
    startLoc: Position,
    noCalls?: ?boolean,
  ): N.Expression {
    const state = {
      optionalChainMember: false,
      maybeAsyncArrow: this.atPossibleAsyncArrow(base),
      stop: false,
    };
    do {
      const oldMaybeInAsyncArrowHead = this.state.maybeInAsyncArrowHead;
      if (state.maybeAsyncArrow) {
        this.state.maybeInAsyncArrowHead = true;
      }
      base = this.parseSubscript(base, startPos, startLoc, noCalls, state);

      // After parsing a subscript, this isn't "async" for sure.
      state.maybeAsyncArrow = false;
      this.state.maybeInAsyncArrowHead = oldMaybeInAsyncArrowHead;
    } while (!state.stop);
    return base;
  }

  /**
   * @param state Set 'state.stop = true' to indicate that we should stop parsing subscripts.
   *   state.optionalChainMember to indicate that the member is currently in OptionalChain
   */
  parseSubscript(
    base: N.Expression,
    startPos: number,
    startLoc: Position,
    noCalls: ?boolean,
    state: N.ParseSubscriptState,
  ): N.Expression {
    if (!noCalls && this.eat(tt.doubleColon)) {
      const node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      node.callee = this.parseNoCallExpr();
      state.stop = true;
      return this.parseSubscripts(
        this.finishNode(node, "BindExpression"),
        startPos,
        startLoc,
        noCalls,
      );
    }
    let optional = false;
    let eventual = false;
    if (this.match(tt.questionDot)) {
      state.optionalChainMember = optional = true;
      if (noCalls && this.lookaheadCharCode() === charCodes.leftParenthesis) {
        state.stop = true;
        return base;
      }
      this.next();
    } else if (this.match(tt.tildeDot)) {
      this.expectPlugin("eventualSend");
      eventual = true;
      if (noCalls && this.lookaheadCharCode() === charCodes.leftParenthesis) {
        state.stop = true;
        return base;
      }
      this.next();
    }
    const computed = this.eat(tt.bracketL);
    if (
      ((optional || eventual) &&
        !this.match(tt.parenL) &&
        !this.match(tt.backQuote)) ||
      computed ||
      this.eat(tt.dot)
    ) {
      const node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      node.property = computed
        ? this.parseExpression()
        : this.parseMaybePrivateName(true);
      node.computed = computed;

      if (node.property.type === "PrivateName") {
        if (node.object.type === "Super") {
          this.raise(startPos, Errors.SuperPrivateField);
        }
        this.classScope.usePrivateName(
          node.property.id.name,
          node.property.start,
        );
      }

      if (computed) {
        this.expect(tt.bracketR);
      }

      if (state.optionalChainMember) {
        node.optional = optional;
        return this.finishNode(node, "OptionalMemberExpression");
      } else if (eventual) {
        base = this.finishNode(node, "EventualMemberExpression");
        if (noCalls || !this.match(tt.parenL)) {
          return base;
        }
        // Fallthrough...
      } else {
        return this.finishNode(node, "MemberExpression");
      }
    }
    if (!noCalls && this.match(tt.parenL)) {
      const oldMaybeInArrowParameters = this.state.maybeInArrowParameters;
      const oldYieldPos = this.state.yieldPos;
      const oldAwaitPos = this.state.awaitPos;
      this.state.maybeInArrowParameters = true;
      this.state.yieldPos = -1;
      this.state.awaitPos = -1;

      this.next();

      let node = this.startNodeAt(startPos, startLoc);
      node.callee = base;

      if (optional) {
        node.optional = true;
        node.arguments = this.parseCallExpressionArguments(tt.parenR, false);
      } else {
        node.arguments = this.parseCallExpressionArguments(
          tt.parenR,
          state.maybeAsyncArrow,
          base.type === "Import",
          base.type !== "Super",
          node,
        );
      }
      this.finishCallExpression(node, state.optionalChainMember, eventual);

      if (
        state.maybeAsyncArrow &&
        this.shouldParseAsyncArrow() &&
        !(optional || eventual)
      ) {
        state.stop = true;

        node = this.parseAsyncArrowFromCallExpression(
          this.startNodeAt(startPos, startLoc),
          node,
        );
        this.checkYieldAwaitInDefaultParams();
        this.state.yieldPos = oldYieldPos;
        this.state.awaitPos = oldAwaitPos;
      } else {
        this.toReferencedListDeep(node.arguments);

        // We keep the old value if it isn't null, for cases like
        //   (x = async(yield)) => {}
        //
        // Hi developer of the future :) If you are implementing generator
        // arrow functions, please read the note below about "await" and
        // verify if the same logic is needed for yield.
        if (oldYieldPos !== -1) this.state.yieldPos = oldYieldPos;

        // Await is trickier than yield. When parsing a possible arrow function
        // (e.g. something starting with `async(`) we don't know if its possible
        // parameters will actually be inside an async arrow function or if it is
        // a normal call expression.
        // If it ended up being a call expression, if we are in a context where
        // await expression are disallowed (and thus "await" is an identifier)
        // we must be careful not to leak this.state.awaitPos to an even outer
        // context, where "await" could not be an identifier.
        // For example, this code is valid because "await" isn't directly inside
        // an async function:
        //
        //     async function a() {
        //       function b(param = async (await)) {
        //       }
        //     }
        //
        if (
          (!this.isAwaitAllowed() && !oldMaybeInArrowParameters) ||
          oldAwaitPos !== -1
        ) {
          this.state.awaitPos = oldAwaitPos;
        }
      }

      this.state.maybeInArrowParameters = oldMaybeInArrowParameters;

      return node;
    } else if (this.match(tt.backQuote)) {
      return this.parseTaggedTemplateExpression(
        startPos,
        startLoc,
        base,
        state,
      );
    } else {
      state.stop = true;
      return base;
    }
  }

  parseTaggedTemplateExpression(
    startPos: number,
    startLoc: Position,
    base: N.Expression,
    state: N.ParseSubscriptState,
    typeArguments?: ?N.TsTypeParameterInstantiation,
  ): N.TaggedTemplateExpression {
    const node: N.TaggedTemplateExpression = this.startNodeAt(
      startPos,
      startLoc,
    );
    node.tag = base;
    node.quasi = this.parseTemplate(true);
    if (typeArguments) node.typeParameters = typeArguments;
    if (state.optionalChainMember) {
      this.raise(startPos, Errors.OptionalChainingNoTemplate);
    }
    return this.finishNode(node, "TaggedTemplateExpression");
  }

  atPossibleAsyncArrow(base: N.Expression): boolean {
    return (
      base.type === "Identifier" &&
      base.name === "async" &&
      this.state.lastTokEnd === base.end &&
      !this.canInsertSemicolon() &&
      // check there are no escape sequences, such as \u{61}sync
      base.end - base.start === 5 &&
      base.start === this.state.potentialArrowAt
    );
  }

  finishCallExpression<
    T:
      | N.CallExpression
      | N.OptionalCallExpression
      | N.EventualCallExpression
      | N.EventualMemberCallExpression,
  >(node: T, optional: boolean, eventual: boolean): N.Expression {
    if (node.callee.type === "Import") {
      if (node.arguments.length === 2) {
        this.expectPlugin("moduleAttributes");
      }
      if (node.arguments.length === 0 || node.arguments.length > 2) {
        this.raise(
          node.start,
          Errors.ImportCallArity,
          this.hasPlugin("moduleAttributes")
            ? "one or two arguments"
            : "one argument",
        );
      } else {
        for (const arg of node.arguments) {
          if (arg.type === "SpreadElement") {
            this.raise(arg.start, Errors.ImportCallSpreadArgument);
          }
        }
      }
    }
    if (eventual) {
      if (node.callee.type === "EventualMemberExpression") {
        const base = node.callee;
        node.callee = base.object;
        node.property = base.property;
        node.computed = base.computed;
        return this.finishNode(node, "EventualMemberCallExpression");
      }
      return this.finishNode(node, "EventualCallExpression");
    }
    return this.finishNode(
      node,
      optional ? "OptionalCallExpression" : "CallExpression",
    );
  }

  parseCallExpressionArguments(
    close: TokenType,
    possibleAsyncArrow: boolean,
    dynamicImport?: boolean,
    allowPlaceholder?: boolean,
    nodeForExtra?: ?N.Node,
  ): $ReadOnlyArray<?N.Expression> {
    const elts = [];
    let innerParenStart;
    let first = true;
    const oldInFSharpPipelineDirectBody = this.state.inFSharpPipelineDirectBody;
    this.state.inFSharpPipelineDirectBody = false;

    while (!this.eat(close)) {
      if (first) {
        first = false;
      } else {
        this.expect(tt.comma);
        if (this.match(close)) {
          if (dynamicImport && !this.hasPlugin("moduleAttributes")) {
            this.raise(
              this.state.lastTokStart,
              Errors.ImportCallArgumentTrailingComma,
            );
          }
          if (nodeForExtra) {
            this.addExtra(
              nodeForExtra,
              "trailingComma",
              this.state.lastTokStart,
            );
          }
          this.next();
          break;
        }
      }

      // we need to make sure that if this is an async arrow functions,
      // that we don't allow inner parens inside the params
      if (this.match(tt.parenL) && !innerParenStart) {
        innerParenStart = this.state.start;
      }

      elts.push(
        this.parseExprListItem(
          false,
          possibleAsyncArrow ? new ExpressionErrors() : undefined,
          possibleAsyncArrow ? { start: 0 } : undefined,
          allowPlaceholder,
        ),
      );
    }

    // we found an async arrow function so let's not allow any inner parens
    if (possibleAsyncArrow && innerParenStart && this.shouldParseAsyncArrow()) {
      this.unexpected();
    }

    this.state.inFSharpPipelineDirectBody = oldInFSharpPipelineDirectBody;

    return elts;
  }

  shouldParseAsyncArrow(): boolean {
    return this.match(tt.arrow) && !this.canInsertSemicolon();
  }

  parseAsyncArrowFromCallExpression(
    node: N.ArrowFunctionExpression,
    call: N.CallExpression,
  ): N.ArrowFunctionExpression {
    this.expect(tt.arrow);
    this.parseArrowExpression(
      node,
      call.arguments,
      true,
      call.extra?.trailingComma,
    );
    return node;
  }

  // Parse a no-call expression (like argument of `new` or `::` operators).

  parseNoCallExpr(): N.Expression {
    const startPos = this.state.start;
    const startLoc = this.state.startLoc;
    return this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
  }

  // Parse an atomic expression — either a single token that is an
  // expression, an expression started by a keyword like `function` or
  // `new`, or an expression wrapped in punctuation like `()`, `[]`,
  // or `{}`.

  parseExprAtom(refExpressionErrors?: ?ExpressionErrors): N.Expression {
    // If a division operator appears in an expression position, the
    // tokenizer got confused, and we force it to read a regexp instead.
    if (this.state.type === tt.slash) this.readRegexp();

    const canBeArrow = this.state.potentialArrowAt === this.state.start;
    let node;

    switch (this.state.type) {
      case tt._super:
        node = this.startNode();
        this.next();
        if (
          this.match(tt.parenL) &&
          !this.scope.allowDirectSuper &&
          !this.options.allowSuperOutsideMethod
        ) {
          this.raise(node.start, Errors.SuperNotAllowed);
        } else if (
          !this.scope.allowSuper &&
          !this.options.allowSuperOutsideMethod
        ) {
          this.raise(node.start, Errors.UnexpectedSuper);
        }

        if (
          !this.match(tt.parenL) &&
          !this.match(tt.bracketL) &&
          !this.match(tt.dot)
        ) {
          this.raise(node.start, Errors.UnsupportedSuper);
        }

        return this.finishNode(node, "Super");

      case tt._import:
        node = this.startNode();
        this.next();

        if (this.match(tt.dot)) {
          return this.parseImportMetaProperty(node);
        }

        if (!this.match(tt.parenL)) {
          this.raise(this.state.lastTokStart, Errors.UnsupportedImport);
        }
        return this.finishNode(node, "Import");
      case tt._this:
        node = this.startNode();
        this.next();
        return this.finishNode(node, "ThisExpression");

      case tt.name: {
        node = this.startNode();
        const containsEsc = this.state.containsEsc;
        const id = this.parseIdentifier();

        if (
          !containsEsc &&
          id.name === "async" &&
          this.match(tt._function) &&
          !this.canInsertSemicolon()
        ) {
          const last = this.state.context.length - 1;
          if (this.state.context[last] !== ct.functionStatement) {
            // Since "async" is an identifier and normally identifiers
            // can't be followed by expression, the tokenizer assumes
            // that "function" starts a statement.
            // Fixing it in the tokenizer would mean tracking not only the
            // previous token ("async"), but also the one before to know
            // its beforeExpr value.
            // It's easier and more efficient to adjust the context here.
            throw new Error("Internal error");
          }
          this.state.context[last] = ct.functionExpression;

          this.next();
          return this.parseFunction(node, undefined, true);
        } else if (
          canBeArrow &&
          !containsEsc &&
          id.name === "async" &&
          this.match(tt.name) &&
          !this.canInsertSemicolon()
        ) {
          const oldMaybeInArrowParameters = this.state.maybeInArrowParameters;
          const oldMaybeInAsyncArrowHead = this.state.maybeInAsyncArrowHead;
          const oldYieldPos = this.state.yieldPos;
          const oldAwaitPos = this.state.awaitPos;
          this.state.maybeInArrowParameters = true;
          this.state.maybeInAsyncArrowHead = true;
          this.state.yieldPos = -1;
          this.state.awaitPos = -1;
          const params = [this.parseIdentifier()];
          this.expect(tt.arrow);
          this.checkYieldAwaitInDefaultParams();
          this.state.maybeInArrowParameters = oldMaybeInArrowParameters;
          this.state.maybeInAsyncArrowHead = oldMaybeInAsyncArrowHead;
          this.state.yieldPos = oldYieldPos;
          this.state.awaitPos = oldAwaitPos;
          // let foo = async bar => {};
          this.parseArrowExpression(node, params, true);
          return node;
        }

        if (canBeArrow && this.match(tt.arrow) && !this.canInsertSemicolon()) {
          this.next();
          this.parseArrowExpression(node, [id], false);
          return node;
        }

        return id;
      }

      case tt._do: {
        this.expectPlugin("doExpressions");
        const node = this.startNode();
        this.next();
        const oldLabels = this.state.labels;
        this.state.labels = [];
        node.body = this.parseBlock();
        this.state.labels = oldLabels;
        return this.finishNode(node, "DoExpression");
      }

      case tt.regexp: {
        const value = this.state.value;
        node = this.parseLiteral(value.value, "RegExpLiteral");
        node.pattern = value.pattern;
        node.flags = value.flags;
        return node;
      }

      case tt.num:
        return this.parseLiteral(this.state.value, "NumericLiteral");

      case tt.bigint:
        return this.parseLiteral(this.state.value, "BigIntLiteral");

      case tt.string:
        return this.parseLiteral(this.state.value, "StringLiteral");

      case tt._null:
        node = this.startNode();
        this.next();
        return this.finishNode(node, "NullLiteral");

      case tt._true:
      case tt._false:
        return this.parseBooleanLiteral();

      case tt.parenL:
        return this.parseParenAndDistinguishExpression(canBeArrow);

      case tt.bracketBarL:
      case tt.bracketHashL: {
        this.expectPlugin("recordAndTuple");
        const oldInFSharpPipelineDirectBody = this.state
          .inFSharpPipelineDirectBody;
        const close =
          this.state.type === tt.bracketBarL ? tt.bracketBarR : tt.bracketR;
        this.state.inFSharpPipelineDirectBody = false;
        node = this.startNode();
        this.next();
        node.elements = this.parseExprList(
          close,
          true,
          refExpressionErrors,
          node,
        );
        this.state.inFSharpPipelineDirectBody = oldInFSharpPipelineDirectBody;
        return this.finishNode(node, "TupleExpression");
      }
      case tt.bracketL: {
        const oldInFSharpPipelineDirectBody = this.state
          .inFSharpPipelineDirectBody;
        this.state.inFSharpPipelineDirectBody = false;
        node = this.startNode();
        this.next();
        node.elements = this.parseExprList(
          tt.bracketR,
          true,
          refExpressionErrors,
          node,
        );
        if (!this.state.maybeInArrowParameters) {
          // This could be an array pattern:
          //   ([a: string, b: string]) => {}
          // In this case, we don't have to call toReferencedList. We will
          // call it, if needed, when we are sure that it is a parenthesized
          // expression by calling toReferencedListDeep.
          this.toReferencedList(node.elements);
        }
        this.state.inFSharpPipelineDirectBody = oldInFSharpPipelineDirectBody;
        return this.finishNode(node, "ArrayExpression");
      }
      case tt.braceBarL:
      case tt.braceHashL: {
        this.expectPlugin("recordAndTuple");
        const oldInFSharpPipelineDirectBody = this.state
          .inFSharpPipelineDirectBody;
        const close =
          this.state.type === tt.braceBarL ? tt.braceBarR : tt.braceR;
        this.state.inFSharpPipelineDirectBody = false;
        const ret = this.parseObj(close, false, true, refExpressionErrors);
        this.state.inFSharpPipelineDirectBody = oldInFSharpPipelineDirectBody;
        return ret;
      }
      case tt.braceL: {
        const oldInFSharpPipelineDirectBody = this.state
          .inFSharpPipelineDirectBody;
        this.state.inFSharpPipelineDirectBody = false;
        const ret = this.parseObj(tt.braceR, false, false, refExpressionErrors);
        this.state.inFSharpPipelineDirectBody = oldInFSharpPipelineDirectBody;
        return ret;
      }
      case tt._function:
        return this.parseFunctionExpression();

      case tt.at:
        this.parseDecorators();
      // fall through
      case tt._class:
        node = this.startNode();
        this.takeDecorators(node);
        return this.parseClass(node, false);

      case tt._new:
        return this.parseNew();

      case tt.backQuote:
        return this.parseTemplate(false);

      case tt.doubleColon: {
        node = this.startNode();
        this.next();
        node.object = null;
        const callee = (node.callee = this.parseNoCallExpr());
        if (callee.type === "MemberExpression") {
          return this.finishNode(node, "BindExpression");
        } else {
          throw this.raise(callee.start, Errors.UnsupportedBind);
        }
      }

      case tt.hash: {
        if (this.state.inPipeline) {
          node = this.startNode();

          if (
            this.getPluginOption("pipelineOperator", "proposal") !== "smart"
          ) {
            this.raise(node.start, Errors.PrimaryTopicRequiresSmartPipeline);
          }

          this.next();

          if (!this.primaryTopicReferenceIsAllowedInCurrentTopicContext()) {
            this.raise(node.start, Errors.PrimaryTopicNotAllowed);
          }

          this.registerTopicReference();
          return this.finishNode(node, "PipelinePrimaryTopicReference");
        }

        const nextCh = this.input.codePointAt(this.state.end);
        if (isIdentifierStart(nextCh) || nextCh === charCodes.backslash) {
          const start = this.state.start;
          // $FlowIgnore It'll either parse a PrivateName or throw.
          node = (this.parseMaybePrivateName(true): N.PrivateName);
          if (this.match(tt._in)) {
            this.expectPlugin("privateIn");
            this.classScope.usePrivateName(node.id.name, node.start);
          } else if (this.hasPlugin("privateIn")) {
            this.raise(
              this.state.start,
              Errors.PrivateInExpectedIn,
              node.id.name,
            );
          } else {
            throw this.unexpected(start);
          }
          return node;
        }
      }
      // fall through
      default:
        throw this.unexpected();
    }
  }

  parseBooleanLiteral(): N.BooleanLiteral {
    const node = this.startNode();
    node.value = this.match(tt._true);
    this.next();
    return this.finishNode(node, "BooleanLiteral");
  }

  parseMaybePrivateName(
    isPrivateNameAllowed: boolean,
  ): N.PrivateName | N.Identifier {
    const isPrivate = this.match(tt.hash);

    if (isPrivate) {
      this.expectOnePlugin(["classPrivateProperties", "classPrivateMethods"]);
      if (!isPrivateNameAllowed) {
        this.raise(this.state.pos, Errors.UnexpectedPrivateField);
      }
      const node = this.startNode();
      this.next();
      this.assertNoSpace("Unexpected space between # and identifier");
      node.id = this.parseIdentifier(true);
      return this.finishNode(node, "PrivateName");
    } else {
      return this.parseIdentifier(true);
    }
  }

  parseFunctionExpression(): N.FunctionExpression | N.MetaProperty {
    const node = this.startNode();

    // We do not do parseIdentifier here because when parseFunctionExpression
    // is called we already know that the current token is a "name" with the value "function"
    // This will improve perf a tiny little bit as we do not do validation but more importantly
    // here is that parseIdentifier will remove an item from the expression stack
    // if "function" or "class" is parsed as identifier (in objects e.g.), which should not happen here.
    let meta = this.startNode();
    this.next();
    meta = this.createIdentifier(meta, "function");

    if (this.prodParam.hasYield && this.eat(tt.dot)) {
      return this.parseMetaProperty(node, meta, "sent");
    }
    return this.parseFunction(node);
  }

  parseMetaProperty(
    node: N.MetaProperty,
    meta: N.Identifier,
    propertyName: string,
  ): N.MetaProperty {
    node.meta = meta;

    if (meta.name === "function" && propertyName === "sent") {
      if (this.isContextual(propertyName)) {
        this.expectPlugin("functionSent");
      } else if (!this.hasPlugin("functionSent")) {
        // The code wasn't `function.sent` but just `function.`, so a simple error is less confusing.
        this.unexpected();
      }
    }

    const containsEsc = this.state.containsEsc;

    node.property = this.parseIdentifier(true);

    if (node.property.name !== propertyName || containsEsc) {
      this.raise(
        node.property.start,
        Errors.UnsupportedMetaProperty,
        meta.name,
        propertyName,
      );
    }

    return this.finishNode(node, "MetaProperty");
  }

  parseImportMetaProperty(node: N.MetaProperty): N.MetaProperty {
    const id = this.createIdentifier(this.startNodeAtNode(node), "import");
    this.expect(tt.dot);

    if (this.isContextual("meta")) {
      if (!this.inModule) {
        this.raiseWithData(
          id.start,
          { code: "BABEL_PARSER_SOURCETYPE_MODULE_REQUIRED" },
          Errors.ImportMetaOutsideModule,
        );
      }
      this.sawUnambiguousESM = true;
    }

    return this.parseMetaProperty(node, id, "meta");
  }

  parseLiteral<T: N.Literal>(
    value: any,
    type: /*T["kind"]*/ string,
    startPos?: number,
    startLoc?: Position,
  ): T {
    startPos = startPos || this.state.start;
    startLoc = startLoc || this.state.startLoc;

    const node = this.startNodeAt(startPos, startLoc);
    this.addExtra(node, "rawValue", value);
    this.addExtra(node, "raw", this.input.slice(startPos, this.state.end));
    node.value = value;
    this.next();
    return this.finishNode(node, type);
  }

  parseParenAndDistinguishExpression(canBeArrow: boolean): N.Expression {
    const startPos = this.state.start;
    const startLoc = this.state.startLoc;

    let val;
    this.expect(tt.parenL);

    const oldMaybeInArrowParameters = this.state.maybeInArrowParameters;
    const oldYieldPos = this.state.yieldPos;
    const oldAwaitPos = this.state.awaitPos;
    const oldInFSharpPipelineDirectBody = this.state.inFSharpPipelineDirectBody;
    this.state.maybeInArrowParameters = true;
    this.state.yieldPos = -1;
    this.state.awaitPos = -1;
    this.state.inFSharpPipelineDirectBody = false;

    const innerStartPos = this.state.start;
    const innerStartLoc = this.state.startLoc;
    const exprList = [];
    const refExpressionErrors = new ExpressionErrors();
    const refNeedsArrowPos = { start: 0 };
    let first = true;
    let spreadStart;
    let optionalCommaStart;

    while (!this.match(tt.parenR)) {
      if (first) {
        first = false;
      } else {
        this.expect(tt.comma, refNeedsArrowPos.start || null);
        if (this.match(tt.parenR)) {
          optionalCommaStart = this.state.start;
          break;
        }
      }

      if (this.match(tt.ellipsis)) {
        const spreadNodeStartPos = this.state.start;
        const spreadNodeStartLoc = this.state.startLoc;
        spreadStart = this.state.start;
        exprList.push(
          this.parseParenItem(
            this.parseRestBinding(),
            spreadNodeStartPos,
            spreadNodeStartLoc,
          ),
        );

        this.checkCommaAfterRest(charCodes.rightParenthesis);

        break;
      } else {
        exprList.push(
          this.parseMaybeAssign(
            false,
            refExpressionErrors,
            this.parseParenItem,
            refNeedsArrowPos,
          ),
        );
      }
    }

    const innerEndPos = this.state.start;
    const innerEndLoc = this.state.startLoc;
    this.expect(tt.parenR);

    this.state.maybeInArrowParameters = oldMaybeInArrowParameters;
    this.state.inFSharpPipelineDirectBody = oldInFSharpPipelineDirectBody;

    let arrowNode = this.startNodeAt(startPos, startLoc);
    if (
      canBeArrow &&
      this.shouldParseArrow() &&
      (arrowNode = this.parseArrow(arrowNode))
    ) {
      if (!this.isAwaitAllowed() && !this.state.maybeInAsyncArrowHead) {
        this.state.awaitPos = oldAwaitPos;
      }
      this.checkYieldAwaitInDefaultParams();
      this.state.yieldPos = oldYieldPos;
      this.state.awaitPos = oldAwaitPos;
      for (const param of exprList) {
        if (param.extra && param.extra.parenthesized) {
          this.unexpected(param.extra.parenStart);
        }
      }

      this.parseArrowExpression(arrowNode, exprList, false);
      return arrowNode;
    }

    // We keep the old value if it isn't null, for cases like
    //   (x = (yield)) => {}
    if (oldYieldPos !== -1) this.state.yieldPos = oldYieldPos;
    if (oldAwaitPos !== -1) this.state.awaitPos = oldAwaitPos;

    if (!exprList.length) {
      this.unexpected(this.state.lastTokStart);
    }
    if (optionalCommaStart) this.unexpected(optionalCommaStart);
    if (spreadStart) this.unexpected(spreadStart);
    this.checkExpressionErrors(refExpressionErrors, true);
    if (refNeedsArrowPos.start) this.unexpected(refNeedsArrowPos.start);

    this.toReferencedListDeep(exprList, /* isParenthesizedExpr */ true);
    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }

    if (!this.options.createParenthesizedExpressions) {
      this.addExtra(val, "parenthesized", true);
      this.addExtra(val, "parenStart", startPos);
      return val;
    }

    const parenExpression = this.startNodeAt(startPos, startLoc);
    parenExpression.expression = val;
    this.finishNode(parenExpression, "ParenthesizedExpression");
    return parenExpression;
  }

  shouldParseArrow(): boolean {
    return !this.canInsertSemicolon();
  }

  parseArrow(node: N.ArrowFunctionExpression): ?N.ArrowFunctionExpression {
    if (this.eat(tt.arrow)) {
      return node;
    }
  }

  parseParenItem(
    node: N.Expression,
    startPos: number, // eslint-disable-line no-unused-vars
    startLoc: Position, // eslint-disable-line no-unused-vars
  ): N.Expression {
    return node;
  }

  // New's precedence is slightly tricky. It must allow its argument to
  // be a `[]` or dot subscript expression, but not a call — at least,
  // not without wrapping it in parentheses. Thus, it uses the noCalls
  // argument to parseSubscripts to prevent it from consuming the
  // argument list.

  parseNew(): N.NewExpression | N.MetaProperty {
    const node = this.startNode();

    let meta = this.startNode();
    this.next();
    meta = this.createIdentifier(meta, "new");

    if (this.eat(tt.dot)) {
      const metaProp = this.parseMetaProperty(node, meta, "target");

      if (!this.scope.inNonArrowFunction && !this.scope.inClass) {
        let error = Errors.UnexpectedNewTarget;

        if (this.hasPlugin("classProperties")) {
          error += " or class properties";
        }

        this.raise(metaProp.start, error);
      }

      return metaProp;
    }

    node.callee = this.parseNoCallExpr();

    if (node.callee.type === "Import") {
      this.raise(node.callee.start, Errors.ImportCallNotNewExpression);
    } else if (
      node.callee.type === "OptionalMemberExpression" ||
      node.callee.type === "OptionalCallExpression"
    ) {
      this.raise(this.state.lastTokEnd, Errors.OptionalChainingNoNew);
    } else if (
      node.callee.type === "EventualMemberExpression" ||
      node.callee.type === "EventualCallExpression"
    ) {
      this.raise(this.state.lastTokEnd, Errors.EventualNoNew);
    } else if (this.eat(tt.questionDot)) {
      this.raise(this.state.start, Errors.OptionalChainingNoNew);
    } else if (this.eat(tt.tildeDot)) {
      this.expectPlugin("eventualSend");
      this.raise(this.state.start, Errors.EventualNoNew);
    }

    this.parseNewArguments(node);
    return this.finishNode(node, "NewExpression");
  }

  parseNewArguments(node: N.NewExpression): void {
    if (this.eat(tt.parenL)) {
      const args = this.parseExprList(tt.parenR);
      this.toReferencedList(args);
      // $FlowFixMe (parseExprList should be all non-null in this case)
      node.arguments = args;
    } else {
      node.arguments = [];
    }
  }

  // Parse template expression.

  parseTemplateElement(isTagged: boolean): N.TemplateElement {
    const elem = this.startNode();
    if (this.state.value === null) {
      if (!isTagged) {
        this.raise(this.state.start + 1, Errors.InvalidEscapeSequenceTemplate);
      }
    }
    elem.value = {
      raw: this.input
        .slice(this.state.start, this.state.end)
        .replace(/\r\n?/g, "\n"),
      cooked: this.state.value,
    };
    this.next();
    elem.tail = this.match(tt.backQuote);
    return this.finishNode(elem, "TemplateElement");
  }

  parseTemplate(isTagged: boolean): N.TemplateLiteral {
    const node = this.startNode();
    this.next();
    node.expressions = [];
    let curElt = this.parseTemplateElement(isTagged);
    node.quasis = [curElt];
    while (!curElt.tail) {
      this.expect(tt.dollarBraceL);
      node.expressions.push(this.parseExpression());
      this.expect(tt.braceR);
      node.quasis.push((curElt = this.parseTemplateElement(isTagged)));
    }
    this.next();
    return this.finishNode(node, "TemplateLiteral");
  }

  // Parse an object literal, binding pattern, or record.

  parseObj<T: N.ObjectPattern | N.ObjectExpression>(
    close: TokenType,
    isPattern: boolean,
    isRecord?: ?boolean,
    refExpressionErrors?: ?ExpressionErrors,
  ): T {
    const propHash: any = Object.create(null);
    let first = true;
    const node = this.startNode();

    node.properties = [];
    this.next();

    while (!this.eat(close)) {
      if (first) {
        first = false;
      } else {
        this.expect(tt.comma);
        if (this.match(close)) {
          this.addExtra(node, "trailingComma", this.state.lastTokStart);
          this.next();
          break;
        }
      }

      const prop = this.parseObjectMember(isPattern, refExpressionErrors);
      if (!isPattern) {
        // $FlowIgnore RestElement will never be returned if !isPattern
        this.checkDuplicatedProto(prop, propHash, refExpressionErrors);
      }

      // $FlowIgnore
      if (prop.shorthand) {
        this.addExtra(prop, "shorthand", true);
      }

      node.properties.push(prop);
    }

    let type = "ObjectExpression";
    if (isPattern) {
      type = "ObjectPattern";
    } else if (isRecord) {
      type = "RecordExpression";
    }
    return this.finishNode(node, type);
  }

  isAsyncProp(prop: N.ObjectProperty): boolean {
    return (
      !prop.computed &&
      prop.key.type === "Identifier" &&
      prop.key.name === "async" &&
      (this.isLiteralPropertyName() ||
        this.match(tt.bracketL) ||
        this.match(tt.star)) &&
      !this.hasPrecedingLineBreak()
    );
  }

  parseObjectMember(
    isPattern: boolean,
    refExpressionErrors?: ?ExpressionErrors,
  ): N.ObjectMember | N.SpreadElement | N.RestElement {
    let decorators = [];
    if (this.match(tt.at)) {
      if (this.hasPlugin("decorators")) {
        this.raise(this.state.start, Errors.UnsupportedPropertyDecorator);
      }

      // we needn't check if decorators (stage 0) plugin is enabled since it's checked by
      // the call to this.parseDecorator
      while (this.match(tt.at)) {
        decorators.push(this.parseDecorator());
      }
    }

    const prop = this.startNode();
    let isGenerator = false;
    let isAsync = false;
    let startPos;
    let startLoc;

    if (this.match(tt.ellipsis)) {
      if (decorators.length) this.unexpected();
      if (isPattern) {
        this.next();
        // Don't use parseRestBinding() as we only allow Identifier here.
        prop.argument = this.parseIdentifier();
        this.checkCommaAfterRest(charCodes.rightCurlyBrace);
        return this.finishNode(prop, "RestElement");
      }

      return this.parseSpread();
    }

    if (decorators.length) {
      prop.decorators = decorators;
      decorators = [];
    }

    prop.method = false;

    if (isPattern || refExpressionErrors) {
      startPos = this.state.start;
      startLoc = this.state.startLoc;
    }

    if (!isPattern) {
      isGenerator = this.eat(tt.star);
    }

    const containsEsc = this.state.containsEsc;
    this.parsePropertyName(prop, /* isPrivateNameAllowed */ false);

    if (!isPattern && !containsEsc && !isGenerator && this.isAsyncProp(prop)) {
      isAsync = true;
      isGenerator = this.eat(tt.star);
      this.parsePropertyName(prop, /* isPrivateNameAllowed */ false);
    } else {
      isAsync = false;
    }

    this.parseObjPropValue(
      prop,
      startPos,
      startLoc,
      isGenerator,
      isAsync,
      isPattern,
      refExpressionErrors,
      containsEsc,
    );

    return prop;
  }

  isGetterOrSetterMethod(prop: N.ObjectMethod, isPattern: boolean): boolean {
    return (
      !isPattern &&
      !prop.computed &&
      prop.key.type === "Identifier" &&
      (prop.key.name === "get" || prop.key.name === "set") &&
      (this.isLiteralPropertyName() || // get foo() {}
        this.match(tt.bracketL)) // get ["string"]() {}
    );
  }

  getGetterSetterExpectedParamCount(
    method: N.ObjectMethod | N.ClassMethod,
  ): number {
    return method.kind === "get" ? 0 : 1;
  }

  // get methods aren't allowed to have any parameters
  // set methods must have exactly 1 parameter which is not a rest parameter
  checkGetterSetterParams(method: N.ObjectMethod | N.ClassMethod): void {
    const paramCount = this.getGetterSetterExpectedParamCount(method);
    const start = method.start;
    if (method.params.length !== paramCount) {
      if (method.kind === "get") {
        this.raise(start, Errors.BadGetterArity);
      } else {
        this.raise(start, Errors.BadSetterArity);
      }
    }

    if (
      method.kind === "set" &&
      method.params[method.params.length - 1].type === "RestElement"
    ) {
      this.raise(start, Errors.BadSetterRestParameter);
    }
  }

  parseObjectMethod(
    prop: N.ObjectMethod,
    isGenerator: boolean,
    isAsync: boolean,
    isPattern: boolean,
    containsEsc: boolean,
  ): ?N.ObjectMethod {
    if (isAsync || isGenerator || this.match(tt.parenL)) {
      if (isPattern) this.unexpected();
      prop.kind = "method";
      prop.method = true;
      return this.parseMethod(
        prop,
        isGenerator,
        isAsync,
        /* isConstructor */ false,
        false,
        "ObjectMethod",
      );
    }

    if (!containsEsc && this.isGetterOrSetterMethod(prop, isPattern)) {
      if (isGenerator || isAsync) this.unexpected();
      prop.kind = prop.key.name;
      this.parsePropertyName(prop, /* isPrivateNameAllowed */ false);
      this.parseMethod(
        prop,
        /* isGenerator */ false,
        /* isAsync */ false,
        /* isConstructor */ false,
        false,
        "ObjectMethod",
      );
      this.checkGetterSetterParams(prop);
      return prop;
    }
  }

  parseObjectProperty(
    prop: N.ObjectProperty,
    startPos: ?number,
    startLoc: ?Position,
    isPattern: boolean,
    refExpressionErrors: ?ExpressionErrors,
  ): ?N.ObjectProperty {
    prop.shorthand = false;

    if (this.eat(tt.colon)) {
      prop.value = isPattern
        ? this.parseMaybeDefault(this.state.start, this.state.startLoc)
        : this.parseMaybeAssign(false, refExpressionErrors);

      return this.finishNode(prop, "ObjectProperty");
    }

    if (!prop.computed && prop.key.type === "Identifier") {
      this.checkReservedWord(prop.key.name, prop.key.start, true, true);

      if (isPattern) {
        prop.value = this.parseMaybeDefault(
          startPos,
          startLoc,
          prop.key.__clone(),
        );
      } else if (this.match(tt.eq) && refExpressionErrors) {
        if (refExpressionErrors.shorthandAssign === -1) {
          refExpressionErrors.shorthandAssign = this.state.start;
        }
        prop.value = this.parseMaybeDefault(
          startPos,
          startLoc,
          prop.key.__clone(),
        );
      } else {
        prop.value = prop.key.__clone();
      }
      prop.shorthand = true;

      return this.finishNode(prop, "ObjectProperty");
    }
  }

  parseObjPropValue(
    prop: any,
    startPos: ?number,
    startLoc: ?Position,
    isGenerator: boolean,
    isAsync: boolean,
    isPattern: boolean,
    refExpressionErrors?: ?ExpressionErrors,
    containsEsc: boolean,
  ): void {
    const node =
      this.parseObjectMethod(
        prop,
        isGenerator,
        isAsync,
        isPattern,
        containsEsc,
      ) ||
      this.parseObjectProperty(
        prop,
        startPos,
        startLoc,
        isPattern,
        refExpressionErrors,
      );

    if (!node) this.unexpected();

    // $FlowFixMe
    return node;
  }

  parsePropertyName(
    prop: N.ObjectOrClassMember | N.ClassMember | N.TsNamedTypeElementBase,
    isPrivateNameAllowed: boolean,
  ): N.Expression | N.Identifier {
    if (this.eat(tt.bracketL)) {
      (prop: $FlowSubtype<N.ObjectOrClassMember>).computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(tt.bracketR);
    } else {
      const oldInPropertyName = this.state.inPropertyName;
      this.state.inPropertyName = true;
      // We check if it's valid for it to be a private name when we push it.
      (prop: $FlowFixMe).key =
        this.match(tt.num) || this.match(tt.string) || this.match(tt.bigint)
          ? this.parseExprAtom()
          : this.parseMaybePrivateName(isPrivateNameAllowed);

      if (prop.key.type !== "PrivateName") {
        // ClassPrivateProperty is never computed, so we don't assign in that case.
        prop.computed = false;
      }

      this.state.inPropertyName = oldInPropertyName;
    }

    return prop.key;
  }

  // Initialize empty function node.

  initFunction(node: N.BodilessFunctionOrMethodBase, isAsync: ?boolean): void {
    node.id = null;
    node.generator = false;
    node.async = !!isAsync;
  }

  // Parse object or class method.

  parseMethod<T: N.MethodLike>(
    node: T,
    isGenerator: boolean,
    isAsync: boolean,
    isConstructor: boolean,
    allowDirectSuper: boolean,
    type: string,
    inClassScope: boolean = false,
  ): T {
    const oldYieldPos = this.state.yieldPos;
    const oldAwaitPos = this.state.awaitPos;
    this.state.yieldPos = -1;
    this.state.awaitPos = -1;

    this.initFunction(node, isAsync);
    node.generator = !!isGenerator;
    const allowModifiers = isConstructor; // For TypeScript parameter properties
    this.scope.enter(
      SCOPE_FUNCTION |
        SCOPE_SUPER |
        (inClassScope ? SCOPE_CLASS : 0) |
        (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0),
    );
    this.prodParam.enter(functionFlags(isAsync, node.generator));
    this.parseFunctionParams((node: any), allowModifiers);
    this.parseFunctionBodyAndFinish(node, type, true);
    this.prodParam.exit();
    this.scope.exit();

    this.state.yieldPos = oldYieldPos;
    this.state.awaitPos = oldAwaitPos;

    return node;
  }

  // Parse arrow function expression.
  // If the parameters are provided, they will be converted to an
  // assignable list.
  parseArrowExpression(
    node: N.ArrowFunctionExpression,
    params: ?(N.Expression[]),
    isAsync: boolean,
    trailingCommaPos: ?number,
  ): N.ArrowFunctionExpression {
    this.scope.enter(SCOPE_FUNCTION | SCOPE_ARROW);
    this.prodParam.enter(functionFlags(isAsync, false));
    this.initFunction(node, isAsync);
    const oldMaybeInArrowParameters = this.state.maybeInArrowParameters;
    const oldYieldPos = this.state.yieldPos;
    const oldAwaitPos = this.state.awaitPos;

    if (params) {
      this.state.maybeInArrowParameters = true;
      this.setArrowFunctionParameters(node, params, trailingCommaPos);
    }
    this.state.maybeInArrowParameters = false;
    this.state.yieldPos = -1;
    this.state.awaitPos = -1;
    this.parseFunctionBody(node, true);

    this.prodParam.exit();
    this.scope.exit();
    this.state.maybeInArrowParameters = oldMaybeInArrowParameters;
    this.state.yieldPos = oldYieldPos;
    this.state.awaitPos = oldAwaitPos;

    return this.finishNode(node, "ArrowFunctionExpression");
  }

  setArrowFunctionParameters(
    node: N.ArrowFunctionExpression,
    params: N.Expression[],
    trailingCommaPos: ?number,
  ): void {
    node.params = this.toAssignableList(params, trailingCommaPos);
  }

  parseFunctionBodyAndFinish(
    node: N.BodilessFunctionOrMethodBase,
    type: string,
    isMethod?: boolean = false,
  ): void {
    // $FlowIgnore (node is not bodiless if we get here)
    this.parseFunctionBody(node, false, isMethod);
    this.finishNode(node, type);
  }

  // Parse function body and check parameters.
  parseFunctionBody(
    node: N.Function,
    allowExpression: ?boolean,
    isMethod?: boolean = false,
  ): void {
    const isExpression = allowExpression && !this.match(tt.braceL);
    const oldInParameters = this.state.inParameters;
    this.state.inParameters = false;

    if (isExpression) {
      node.body = this.parseMaybeAssign();
      this.checkParams(node, false, allowExpression, false);
    } else {
      const oldStrict = this.state.strict;
      // Start a new scope with regard to labels
      // flag (restore them to their old value afterwards).
      const oldLabels = this.state.labels;
      this.state.labels = [];

      // FunctionBody[Yield, Await]:
      //   StatementList[?Yield, ?Await, +Return] opt
      this.prodParam.enter(this.prodParam.currentFlags() | PARAM_RETURN);
      node.body = this.parseBlock(
        true,
        false,
        // Strict mode function checks after we parse the statements in the function body.
        (hasStrictModeDirective: boolean) => {
          const nonSimple = !this.isSimpleParamList(node.params);

          if (hasStrictModeDirective && nonSimple) {
            // This logic is here to align the error location with the ESTree plugin.
            const errorPos =
              // $FlowIgnore
              (node.kind === "method" || node.kind === "constructor") &&
              // $FlowIgnore
              !!node.key
                ? node.key.end
                : node.start;
            this.raise(errorPos, Errors.IllegalLanguageModeDirective);
          }

          const strictModeChanged = !oldStrict && this.state.strict;

          // Add the params to varDeclaredNames to ensure that an error is thrown
          // if a let/const declaration in the function clashes with one of the params.
          this.checkParams(
            node,
            !this.state.strict && !allowExpression && !isMethod && !nonSimple,
            allowExpression,
            strictModeChanged,
          );

          // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
          if (this.state.strict && node.id) {
            this.checkLVal(
              node.id,
              BIND_OUTSIDE,
              undefined,
              "function name",
              undefined,
              strictModeChanged,
            );
          }
        },
      );
      this.prodParam.exit();
      this.state.labels = oldLabels;
    }

    this.state.inParameters = oldInParameters;
  }

  isSimpleParamList(
    params: $ReadOnlyArray<N.Pattern | N.TSParameterProperty>,
  ): boolean {
    for (let i = 0, len = params.length; i < len; i++) {
      if (params[i].type !== "Identifier") return false;
    }
    return true;
  }

  checkParams(
    node: N.Function,
    allowDuplicates: boolean,
    // eslint-disable-next-line no-unused-vars
    isArrowFunction: ?boolean,
    strictModeChanged?: boolean = true,
  ): void {
    // $FlowIssue
    const nameHash: {} = Object.create(null);
    for (let i = 0; i < node.params.length; i++) {
      this.checkLVal(
        node.params[i],
        BIND_VAR,
        allowDuplicates ? null : nameHash,
        "function parameter list",
        undefined,
        strictModeChanged,
      );
    }
  }

  // Parses a comma-separated list of expressions, and returns them as
  // an array. `close` is the token type that ends the list, and
  // `allowEmpty` can be turned on to allow subsequent commas with
  // nothing in between them to be parsed as `null` (which is needed
  // for array literals).

  parseExprList(
    close: TokenType,
    allowEmpty?: boolean,
    refExpressionErrors?: ?ExpressionErrors,
    nodeForExtra?: ?N.Node,
  ): $ReadOnlyArray<?N.Expression> {
    const elts = [];
    let first = true;

    while (!this.eat(close)) {
      if (first) {
        first = false;
      } else {
        this.expect(tt.comma);
        if (this.match(close)) {
          if (nodeForExtra) {
            this.addExtra(
              nodeForExtra,
              "trailingComma",
              this.state.lastTokStart,
            );
          }
          this.next();
          break;
        }
      }

      elts.push(this.parseExprListItem(allowEmpty, refExpressionErrors));
    }
    return elts;
  }

  parseExprListItem(
    allowEmpty: ?boolean,
    refExpressionErrors?: ?ExpressionErrors,
    refNeedsArrowPos: ?Pos,
    allowPlaceholder: ?boolean,
  ): ?N.Expression {
    let elt;
    if (allowEmpty && this.match(tt.comma)) {
      elt = null;
    } else if (this.match(tt.ellipsis)) {
      const spreadNodeStartPos = this.state.start;
      const spreadNodeStartLoc = this.state.startLoc;
      elt = this.parseParenItem(
        this.parseSpread(refExpressionErrors, refNeedsArrowPos),
        spreadNodeStartPos,
        spreadNodeStartLoc,
      );
    } else if (this.match(tt.question)) {
      this.expectPlugin("partialApplication");
      if (!allowPlaceholder) {
        this.raise(this.state.start, Errors.UnexpectedArgumentPlaceholder);
      }
      const node = this.startNode();
      this.next();
      elt = this.finishNode(node, "ArgumentPlaceholder");
    } else {
      elt = this.parseMaybeAssign(
        false,
        refExpressionErrors,
        this.parseParenItem,
        refNeedsArrowPos,
      );
    }
    return elt;
  }

  // Parse the next token as an identifier. If `liberal` is true (used
  // when parsing properties), it will also convert keywords into
  // identifiers.
  // This shouldn't be used to parse the keywords of meta properties, since they
  // are not identifiers and cannot contain escape sequences.

  parseIdentifier(liberal?: boolean): N.Identifier {
    const node = this.startNode();
    const name = this.parseIdentifierName(node.start, liberal);

    return this.createIdentifier(node, name);
  }

  createIdentifier(node: N.Identifier, name: string): N.Identifier {
    node.name = name;
    node.loc.identifierName = name;

    return this.finishNode(node, "Identifier");
  }

  parseIdentifierName(pos: number, liberal?: boolean): string {
    let name: string;

    if (this.match(tt.name)) {
      name = this.state.value;
    } else if (this.state.type.keyword) {
      name = this.state.type.keyword;

      // `class` and `function` keywords push function-type token context into this.context.
      // But there is no chance to pop the context if the keyword is consumed
      // as an identifier such as a property name.
      const context = this.state.context;
      if (
        (name === "class" || name === "function") &&
        context[context.length - 1].token === "function"
      ) {
        context.pop();
      }
    } else {
      throw this.unexpected();
    }

    if (liberal) {
      // If the current token is not used as a keyword, set its type to "tt.name".
      // This will prevent this.next() from throwing about unexpected escapes.
      this.state.type = tt.name;
    } else {
      this.checkReservedWord(
        name,
        this.state.start,
        !!this.state.type.keyword,
        false,
      );
    }

    this.next();

    return name;
  }

  checkReservedWord(
    word: string,
    startLoc: number,
    checkKeywords: boolean,
    isBinding: boolean,
  ): void {
    if (this.prodParam.hasYield && word === "yield") {
      this.raise(startLoc, Errors.YieldBindingIdentifier);
      return;
    }

    if (word === "await") {
      if (this.prodParam.hasAwait) {
        this.raise(startLoc, Errors.AwaitBindingIdentifier);
        return;
      }
      if (
        this.state.awaitPos === -1 &&
        (this.state.maybeInAsyncArrowHead || this.isAwaitAllowed())
      ) {
        this.state.awaitPos = this.state.start;
      }
    }

    if (
      this.scope.inClass &&
      !this.scope.inNonArrowFunction &&
      word === "arguments"
    ) {
      this.raise(startLoc, Errors.ArgumentsDisallowedInInitializer);
      return;
    }
    if (checkKeywords && isKeyword(word)) {
      this.raise(startLoc, Errors.UnexpectedKeyword, word);
      return;
    }

    const reservedTest = !this.state.strict
      ? isReservedWord
      : isBinding
      ? isStrictBindReservedWord
      : isStrictReservedWord;

    if (reservedTest(word, this.inModule)) {
      if (!this.prodParam.hasAwait && word === "await") {
        this.raise(startLoc, Errors.AwaitNotInAsyncFunction);
      } else {
        this.raise(startLoc, Errors.UnexpectedReservedWord, word);
      }
    }
  }

  isAwaitAllowed(): boolean {
    if (this.scope.inFunction) return this.prodParam.hasAwait;
    if (this.options.allowAwaitOutsideFunction) return true;
    if (this.hasPlugin("topLevelAwait")) {
      return this.inModule && this.prodParam.hasAwait;
    }
    return false;
  }

  // Parses await expression inside async function.

  parseAwait(): N.AwaitExpression {
    const node = this.startNode();

    this.next();

    if (this.state.inParameters) {
      this.raise(node.start, Errors.AwaitExpressionFormalParameter);
    } else if (this.state.awaitPos === -1) {
      this.state.awaitPos = node.start;
    }
    if (this.eat(tt.star)) {
      this.raise(node.start, Errors.ObsoleteAwaitStar);
    }

    if (!this.scope.inFunction && !this.options.allowAwaitOutsideFunction) {
      if (
        this.hasPrecedingLineBreak() ||
        // All the following expressions are ambiguous:
        //   await + 0, await - 0, await ( 0 ), await [ 0 ], await / 0 /u, await ``
        this.match(tt.plusMin) ||
        this.match(tt.parenL) ||
        this.match(tt.bracketL) ||
        this.match(tt.backQuote) ||
        // Sometimes the tokenizer generates tt.slash for regexps, and this is
        // handler by parseExprAtom
        this.match(tt.regexp) ||
        this.match(tt.slash) ||
        // This code could be parsed both as a modulo operator or as an intrinsic:
        //   await %x(0)
        (this.hasPlugin("v8intrinsic") && this.match(tt.modulo))
      ) {
        this.ambiguousScriptDifferentAst = true;
      } else {
        this.sawUnambiguousESM = true;
      }
    }

    if (!this.state.soloAwait) {
      node.argument = this.parseMaybeUnary();
    }

    return this.finishNode(node, "AwaitExpression");
  }

  // Parses yield expression inside generator.

  parseYield(noIn?: ?boolean): N.YieldExpression {
    const node = this.startNode();

    if (this.state.inParameters) {
      this.raise(node.start, Errors.YieldInParameter);
    } else if (this.state.yieldPos === -1) {
      this.state.yieldPos = node.start;
    }

    this.next();
    if (
      this.match(tt.semi) ||
      (!this.match(tt.star) && !this.state.type.startsExpr) ||
      this.hasPrecedingLineBreak()
    ) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(tt.star);
      node.argument = this.parseMaybeAssign(noIn);
    }
    return this.finishNode(node, "YieldExpression");
  }

  // Validates a pipeline (for any of the pipeline Babylon plugins) at the point
  // of the infix operator `|>`.

  checkPipelineAtInfixOperator(left: N.Expression, leftStartPos: number) {
    if (this.getPluginOption("pipelineOperator", "proposal") === "smart") {
      if (left.type === "SequenceExpression") {
        // Ensure that the pipeline head is not a comma-delimited
        // sequence expression.
        this.raise(leftStartPos, Errors.PipelineHeadSequenceExpression);
      }
    }
  }

  parseSmartPipelineBody(
    childExpression: N.Expression,
    startPos: number,
    startLoc: Position,
  ): N.PipelineBody {
    const pipelineStyle = this.checkSmartPipelineBodyStyle(childExpression);

    this.checkSmartPipelineBodyEarlyErrors(
      childExpression,
      pipelineStyle,
      startPos,
    );

    return this.parseSmartPipelineBodyInStyle(
      childExpression,
      pipelineStyle,
      startPos,
      startLoc,
    );
  }

  checkSmartPipelineBodyEarlyErrors(
    childExpression: N.Expression,
    pipelineStyle: N.PipelineStyle,
    startPos: number,
  ): void {
    if (this.match(tt.arrow)) {
      // If the following token is invalidly `=>`, then throw a human-friendly error
      // instead of something like 'Unexpected token, expected ";"'.
      throw this.raise(this.state.start, Errors.PipelineBodyNoArrow);
    } else if (
      pipelineStyle === "PipelineTopicExpression" &&
      childExpression.type === "SequenceExpression"
    ) {
      this.raise(startPos, Errors.PipelineBodySequenceExpression);
    }
  }

  parseSmartPipelineBodyInStyle(
    childExpression: N.Expression,
    pipelineStyle: N.PipelineStyle,
    startPos: number,
    startLoc: Position,
  ): N.PipelineBody {
    const bodyNode = this.startNodeAt(startPos, startLoc);
    switch (pipelineStyle) {
      case "PipelineBareFunction":
        bodyNode.callee = childExpression;
        break;
      case "PipelineBareConstructor":
        bodyNode.callee = childExpression.callee;
        break;
      case "PipelineBareAwaitedFunction":
        bodyNode.callee = childExpression.argument;
        break;
      case "PipelineTopicExpression":
        if (!this.topicReferenceWasUsedInCurrentTopicContext()) {
          this.raise(startPos, Errors.PipelineTopicUnused);
        }
        bodyNode.expression = childExpression;
        break;
      default:
        throw new Error(
          `Internal @babel/parser error: Unknown pipeline style (${pipelineStyle})`,
        );
    }
    return this.finishNode(bodyNode, pipelineStyle);
  }

  checkSmartPipelineBodyStyle(expression: N.Expression): N.PipelineStyle {
    switch (expression.type) {
      default:
        return this.isSimpleReference(expression)
          ? "PipelineBareFunction"
          : "PipelineTopicExpression";
    }
  }

  isSimpleReference(expression: N.Expression): boolean {
    switch (expression.type) {
      case "MemberExpression":
        return (
          !expression.computed && this.isSimpleReference(expression.object)
        );
      case "Identifier":
        return true;
      default:
        return false;
    }
  }

  // Enable topic references from outer contexts within smart pipeline bodies.
  // The function modifies the parser's topic-context state to enable or disable
  // the use of topic references with the smartPipelines plugin. They then run a
  // callback, then they reset the parser to the old topic-context state that it
  // had before the function was called.

  withTopicPermittingContext<T>(callback: () => T): T {
    const outerContextTopicState = this.state.topicContext;
    this.state.topicContext = {
      // Enable the use of the primary topic reference.
      maxNumOfResolvableTopics: 1,
      // Hide the use of any topic references from outer contexts.
      maxTopicIndex: null,
    };

    try {
      return callback();
    } finally {
      this.state.topicContext = outerContextTopicState;
    }
  }

  // Disable topic references from outer contexts within syntax constructs
  // such as the bodies of iteration statements.
  // The function modifies the parser's topic-context state to enable or disable
  // the use of topic references with the smartPipelines plugin. They then run a
  // callback, then they reset the parser to the old topic-context state that it
  // had before the function was called.

  withTopicForbiddingContext<T>(callback: () => T): T {
    const outerContextTopicState = this.state.topicContext;
    this.state.topicContext = {
      // Disable the use of the primary topic reference.
      maxNumOfResolvableTopics: 0,
      // Hide the use of any topic references from outer contexts.
      maxTopicIndex: null,
    };

    try {
      return callback();
    } finally {
      this.state.topicContext = outerContextTopicState;
    }
  }

  withSoloAwaitPermittingContext<T>(callback: () => T): T {
    const outerContextSoloAwaitState = this.state.soloAwait;
    this.state.soloAwait = true;

    try {
      return callback();
    } finally {
      this.state.soloAwait = outerContextSoloAwaitState;
    }
  }

  // Register the use of a primary topic reference (`#`) within the current
  // topic context.
  registerTopicReference(): void {
    this.state.topicContext.maxTopicIndex = 0;
  }

  primaryTopicReferenceIsAllowedInCurrentTopicContext(): boolean {
    return this.state.topicContext.maxNumOfResolvableTopics >= 1;
  }

  topicReferenceWasUsedInCurrentTopicContext(): boolean {
    return (
      this.state.topicContext.maxTopicIndex != null &&
      this.state.topicContext.maxTopicIndex >= 0
    );
  }

  parseFSharpPipelineBody(prec: number, noIn: ?boolean): N.Expression {
    const startPos = this.state.start;
    const startLoc = this.state.startLoc;

    this.state.potentialArrowAt = this.state.start;
    const oldInFSharpPipelineDirectBody = this.state.inFSharpPipelineDirectBody;
    this.state.inFSharpPipelineDirectBody = true;

    const ret = this.parseExprOp(
      this.parseMaybeUnary(),
      startPos,
      startLoc,
      prec,
      noIn,
    );

    this.state.inFSharpPipelineDirectBody = oldInFSharpPipelineDirectBody;

    return ret;
  }
}
