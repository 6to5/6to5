// The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design

import { types as tt } from "./types";

export class TokContext {
  constructor(
    token: string,
    isExpr?: boolean,
    preserveSpace?: boolean,
    override?: Function | null, // Takes a Tokenizer as a this-parameter, and returns void.
  ) {
    this.token = token;
    this.isExpr = !!isExpr;
    this.preserveSpace = !!preserveSpace;
    this.override = override;
  }

  token: string;
  isExpr: boolean;
  preserveSpace: boolean;
  override: Function | undefined | null;
}

export const types: {
  [key: string]: TokContext;
} = {
  braceStatement: new TokContext("{", false),
  braceExpression: new TokContext("{", true),
  recordExpression: new TokContext("#{", true),
  templateQuasi: new TokContext("${", false),
  parenStatement: new TokContext("(", false),
  parenExpression: new TokContext("(", true),
  template: new TokContext("`", true, true, p => p.readTmplToken()),
  functionExpression: new TokContext("function", true),
  functionStatement: new TokContext("function", false),
};

// Token-specific context update code
// Note that we should avoid accessing `this.prodParam` in context update,
// because it is executed immediately when last token is consumed, which may be
// before `this.prodParam` is updated. e.g.
// ```
// function *g() { () => yield / 2 }
// ```
// When `=>` is eaten, the context update of `yield` is executed, however,
// `this.prodParam` still has `[Yield]` production because it is not yet updated

tt.parenR.updateContext = tt.braceR.updateContext = function () {
  if (this.state.context.length === 1) {
    this.state.exprAllowed = true;
    return;
  }

  let out = this.state.context.pop();
  if (out === types.braceStatement && this.curContext().token === "function") {
    out = this.state.context.pop();
  }

  this.state.exprAllowed = !out.isExpr;
};

tt.name.updateContext = function (prevType) {
  let allowed = false;
  if (prevType !== tt.dot) {
    if (
      this.state.value === "of" &&
      !this.state.exprAllowed &&
      prevType !== tt._function &&
      prevType !== tt._class
    ) {
      allowed = true;
    }
  }
  this.state.exprAllowed = allowed;
};

tt.braceL.updateContext = function (prevType) {
  this.state.context.push(
    this.braceIsBlock(prevType) ? types.braceStatement : types.braceExpression,
  );
  this.state.exprAllowed = true;
};

tt.dollarBraceL.updateContext = function () {
  this.state.context.push(types.templateQuasi);
  this.state.exprAllowed = true;
};

tt.parenL.updateContext = function (prevType) {
  const statementParens =
    prevType === tt._if ||
    prevType === tt._for ||
    prevType === tt._with ||
    prevType === tt._while;
  this.state.context.push(
    statementParens ? types.parenStatement : types.parenExpression,
  );
  this.state.exprAllowed = true;
};

tt.incDec.updateContext = function () {
  // tokExprAllowed stays unchanged
};

tt._function.updateContext = tt._class.updateContext = function (prevType) {
  if (
    prevType.beforeExpr &&
    prevType !== tt.semi &&
    prevType !== tt._else &&
    !(prevType === tt._return && this.hasPrecedingLineBreak()) &&
    !(
      (prevType === tt.colon || prevType === tt.braceL) &&
      this.curContext() === types.b_stat
    )
  ) {
    this.state.context.push(types.functionExpression);
  } else {
    this.state.context.push(types.functionStatement);
  }

  this.state.exprAllowed = false;
};

tt.backQuote.updateContext = function () {
  if (this.curContext() === types.template) {
    this.state.context.pop();
  } else {
    this.state.context.push(types.template);
  }
  this.state.exprAllowed = false;
};

// we don't need to update context for tt.braceBarL because we do not pop context for tt.braceBarR
tt.braceHashL.updateContext = function () {
  this.state.context.push(types.recordExpression);
  this.state.exprAllowed = true; /* tt.braceHashL.beforeExpr */
};
