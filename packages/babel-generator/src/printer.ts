import Buffer from "./buffer";
import * as n from "./node";
import * as t from "@babel/types";

import * as generatorFunctions from "./generators";
import type SourceMap from "./source-map";

const SCIENTIFIC_NOTATION = /e/i;
const ZERO_DECIMAL_INTEGER = /\.0+$/;
const NON_DECIMAL_LITERAL = /^0[box]/;
const PURE_ANNOTATION_RE = /^\s*[@#]__PURE__\s*$/;

export type Format = {
  shouldPrintComment: (comment: string) => boolean;
  retainLines: boolean;
  retainFunctionParens: boolean;
  comments: boolean;
  auxiliaryCommentBefore: string;
  auxiliaryCommentAfter: string;
  compact: boolean | "auto";
  minified: boolean;
  concise: boolean;
  indent: {
    adjustMultilineComment: boolean;
    style: string;
    base: number;
  };
  decoratorsBeforeExport: boolean;
  recordAndTupleSyntaxType: "bar" | "hash";
  jsescOption;
  jsonCompatibleStrings?;
  /**
   * For use with the Hack-style pipe operator.
   * Changes what token is used for pipe bodies’ topic references.
   */
  topicToken?: "#";
};

class Printer {
  constructor(format: Format, map: SourceMap) {
    this.format = format;
    this._buf = new Buffer(map);
  }

  declare format: Format;
  inForStatementInitCounter: number = 0;

  declare _buf: Buffer;
  _printStack: Array<t.Node> = [];
  _indent: number = 0;
  _insideAux: boolean = false;
  _parenPushNewlineState: any = null;
  _noLineTerminator: boolean = false;
  _printAuxAfterOnNextUserNode: boolean = false;
  _printedComments: WeakSet<any> = new WeakSet();
  _endsWithInteger = false;
  _endsWithWord = false;

  generate(ast) {
    this.print(ast);
    this._maybeAddAuxComment();

    return this._buf.get();
  }

  /**
   * Increment indent size.
   */

  indent(): void {
    if (this.format.compact || this.format.concise) return;

    this._indent++;
  }

  /**
   * Decrement indent size.
   */

  dedent(): void {
    if (this.format.compact || this.format.concise) return;

    this._indent--;
  }

  /**
   * Add a semicolon to the buffer.
   */

  semicolon(force: boolean = false): void {
    this._maybeAddAuxComment();
    this._append(";", !force /* queue */);
  }

  /**
   * Add a right brace to the buffer.
   */

  rightBrace(): void {
    if (this.format.minified) {
      this._buf.removeLastSemicolon();
    }
    this.token("}");
  }

  /**
   * Add a space to the buffer unless it is compact.
   */

  space(force: boolean = false): void {
    if (this.format.compact) return;

    if (
      (this._buf.hasContent() && !this.endsWith(" ") && !this.endsWith("\n")) ||
      force
    ) {
      this._space();
    }
  }

  /**
   * Writes a token that can't be safely parsed without taking whitespace into account.
   */

  word(str: string): void {
    // prevent concatenating words and creating // comment out of division and regex
    if (this._endsWithWord || (this.endsWith("/") && str.indexOf("/") === 0)) {
      this._space();
    }

    this._maybeAddAuxComment();
    this._append(str);

    this._endsWithWord = true;
  }

  /**
   * Writes a number token so that we can validate if it is an integer.
   */

  number(str: string): void {
    this.word(str);

    // Integer tokens need special handling because they cannot have '.'s inserted
    // immediately after them.
    this._endsWithInteger =
      Number.isInteger(+str) &&
      !NON_DECIMAL_LITERAL.test(str) &&
      !SCIENTIFIC_NOTATION.test(str) &&
      !ZERO_DECIMAL_INTEGER.test(str) &&
      str[str.length - 1] !== ".";
  }

  /**
   * Writes a simple token.
   */

  token(str: string): void {
    // space is mandatory to avoid outputting <!--
    // http://javascript.spec.whatwg.org/#comment-syntax
    if (
      (str === "--" && this.endsWith("!")) ||
      // Need spaces for operators of the same kind to avoid: `a+++b`
      (str[0] === "+" && this.endsWith("+")) ||
      (str[0] === "-" && this.endsWith("-")) ||
      // Needs spaces to avoid changing '34' to '34.', which would still be a valid number.
      (str[0] === "." && this._endsWithInteger)
    ) {
      this._space();
    }

    this._maybeAddAuxComment();
    this._append(str);
  }

  /**
   * Add a newline (or many newlines), maintaining formatting.
   */

  newline(i?: number): void {
    if (this.format.retainLines || this.format.compact) return;

    if (this.format.concise) {
      this.space();
      return;
    }

    // never allow more than two lines
    if (this.endsWith("\n\n")) return;

    if (typeof i !== "number") i = 1;

    i = Math.min(2, i);
    if (this.endsWith("{\n") || this.endsWith(":\n")) i--;
    if (i <= 0) return;

    for (let j = 0; j < i; j++) {
      this._newline();
    }
  }

  endsWith(str: string): boolean {
    return this._buf.endsWith(str);
  }

  removeTrailingNewline(): void {
    this._buf.removeTrailingNewline();
  }

  exactSource(loc: any, cb: () => void) {
    this._catchUp("start", loc);

    this._buf.exactSource(loc, cb);
  }

  source(prop: string, loc: any): void {
    this._catchUp(prop, loc);

    this._buf.source(prop, loc);
  }

  withSource(prop: string, loc: any, cb: () => void): void {
    this._catchUp(prop, loc);

    this._buf.withSource(prop, loc, cb);
  }

  _space(): void {
    this._append(" ", true /* queue */);
  }

  _newline(): void {
    this._append("\n", true /* queue */);
  }

  _append(str: string, queue: boolean = false) {
    this._maybeAddParen(str);
    this._maybeIndent(str);

    if (queue) this._buf.queue(str);
    else this._buf.append(str);

    this._endsWithWord = false;
    this._endsWithInteger = false;
  }

  _maybeIndent(str: string): void {
    // we've got a newline before us so prepend on the indentation
    if (this._indent && this.endsWith("\n") && str[0] !== "\n") {
      this._buf.queue(this._getIndent());
    }
  }

  _maybeAddParen(str: string): void {
    // see startTerminatorless() instance method
    const parenPushNewlineState = this._parenPushNewlineState;
    if (!parenPushNewlineState) return;

    // This function does two things:
    // - If needed, prints a parenthesis
    // - If the currently printed string removes the need for the paren,
    //   it resets the _parenPushNewlineState field.
    //   Almost everything removes the need for a paren, except for
    //   comments and whitespaces.

    let i;
    for (i = 0; i < str.length && str[i] === " "; i++) continue;
    if (i === str.length) {
      // Whitespaces only, the parentheses might still be needed.
      return;
    }

    // Check for newline or comment.
    const cha = str[i];
    if (cha !== "\n") {
      if (
        // This is not a comment (it doesn't start with /)
        cha !== "/" ||
        // This is not a comment (it's a / operator)
        i + 1 === str.length
      ) {
        // After a normal token, the parentheses aren't needed anymore
        this._parenPushNewlineState = null;
        return;
      }

      const chaPost = str[i + 1];

      if (chaPost === "*") {
        // This is a block comment

        if (PURE_ANNOTATION_RE.test(str.slice(i + 2, str.length - 2))) {
          // We avoid printing newlines after #__PURE__ comments (we treat
          // then as unary operators), but we must keep the old
          // parenPushNewlineState because, if a newline was forbidden, it is
          // still forbidden after the comment.
          return;
        }

        // NOTE: code flow continues from here to after these if/elses
      } else if (chaPost !== "/") {
        // This is neither a block comment, nor a line comment.
        // After a normal token, the parentheses aren't needed anymore
        this._parenPushNewlineState = null;
        return;
      }
    }

    this.token("(");
    this.indent();
    parenPushNewlineState.printed = true;
  }

  _catchUp(prop: string, loc: any) {
    if (!this.format.retainLines) return;

    // catch up to this nodes newline if we're behind
    const pos = loc ? loc[prop] : null;
    if (pos?.line != null) {
      const count = pos.line - this._buf.getCurrentLine();

      for (let i = 0; i < count; i++) {
        this._newline();
      }
    }
  }

  /**
   * Get the current indent.
   */

  _getIndent(): string {
    return this.format.indent.style.repeat(this._indent);
  }

  /**
   * Set some state that will be modified if a newline has been inserted before any
   * non-space characters.
   *
   * This is to prevent breaking semantics for terminatorless separator nodes. eg:
   *
   *   return foo;
   *
   * returns `foo`. But if we do:
   *
   *   return
   *   foo;
   *
   *  `undefined` will be returned and not `foo` due to the terminator.
   */

  startTerminatorless(isLabel: boolean = false): any {
    if (isLabel) {
      this._noLineTerminator = true;
      return null;
    } else {
      return (this._parenPushNewlineState = {
        printed: false,
      });
    }
  }

  /**
   * Print an ending parentheses if a starting one has been printed.
   */

  endTerminatorless(state?: any) {
    this._noLineTerminator = false;
    if (state?.printed) {
      this.dedent();
      this.newline();
      this.token(")");
    }
  }

  print(node, parent?) {
    if (!node) return;

    const oldConcise = this.format.concise;
    if (node._compact) {
      this.format.concise = true;
    }

    const printMethod = this[node.type];
    if (!printMethod) {
      throw new ReferenceError(
        `unknown node of type ${JSON.stringify(
          node.type,
        )} with constructor ${JSON.stringify(node?.constructor.name)}`,
      );
    }

    this._printStack.push(node);

    const oldInAux = this._insideAux;
    this._insideAux = !node.loc;
    this._maybeAddAuxComment(this._insideAux && !oldInAux);

    let needsParens = n.needsParens(node, parent, this._printStack);
    if (
      this.format.retainFunctionParens &&
      node.type === "FunctionExpression" &&
      node.extra &&
      node.extra.parenthesized
    ) {
      needsParens = true;
    }
    if (needsParens) this.token("(");

    this._printLeadingComments(node);

    const loc = t.isProgram(node) || t.isFile(node) ? null : node.loc;
    this.withSource("start", loc, () => {
      printMethod.call(this, node, parent);
    });

    this._printTrailingComments(node);

    if (needsParens) this.token(")");

    // end
    this._printStack.pop();

    this.format.concise = oldConcise;
    this._insideAux = oldInAux;
  }

  _maybeAddAuxComment(enteredPositionlessNode?) {
    if (enteredPositionlessNode) this._printAuxBeforeComment();
    if (!this._insideAux) this._printAuxAfterComment();
  }

  _printAuxBeforeComment() {
    if (this._printAuxAfterOnNextUserNode) return;
    this._printAuxAfterOnNextUserNode = true;

    const comment = this.format.auxiliaryCommentBefore;
    if (comment) {
      this._printComment({
        type: "CommentBlock",
        value: comment,
      });
    }
  }

  _printAuxAfterComment() {
    if (!this._printAuxAfterOnNextUserNode) return;
    this._printAuxAfterOnNextUserNode = false;

    const comment = this.format.auxiliaryCommentAfter;
    if (comment) {
      this._printComment({
        type: "CommentBlock",
        value: comment,
      });
    }
  }

  getPossibleRaw(node) {
    const extra = node.extra;
    if (
      extra &&
      extra.raw != null &&
      extra.rawValue != null &&
      node.value === extra.rawValue
    ) {
      return extra.raw;
    }
  }

  printJoin(nodes: Array<any> | undefined | null, parent: any, opts: any = {}) {
    if (!nodes?.length) return;

    if (opts.indent) this.indent();

    const newlineOpts = {
      addNewlines: opts.addNewlines,
    };

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue;

      if (opts.statement) this._printNewline(true, node, parent, newlineOpts);

      this.print(node, parent);

      if (opts.iterator) {
        opts.iterator(node, i);
      }

      if (opts.separator && i < nodes.length - 1) {
        opts.separator.call(this);
      }

      if (opts.statement) this._printNewline(false, node, parent, newlineOpts);
    }

    if (opts.indent) this.dedent();
  }

  printAndIndentOnComments(node, parent) {
    const indent = node.leadingComments && node.leadingComments.length > 0;
    if (indent) this.indent();
    this.print(node, parent);
    if (indent) this.dedent();
  }

  printBlock(parent) {
    const node = parent.body;

    if (!t.isEmptyStatement(node)) {
      this.space();
    }

    this.print(node, parent);
  }

  _printTrailingComments(node) {
    this._printComments(this._getComments(false, node));
  }

  _printLeadingComments(node) {
    this._printComments(
      this._getComments(true, node),
      // Don't add leading/trailing new lines to #__PURE__ annotations
      true,
    );
  }

  printInnerComments(node, indent = true) {
    if (!node.innerComments?.length) return;
    if (indent) this.indent();
    this._printComments(node.innerComments);
    if (indent) this.dedent();
  }

  printSequence(
    nodes,
    parent,
    opts: {
      statement?: boolean;
      indent?: boolean;
      addNewlines?: Function;
    } = {},
  ) {
    opts.statement = true;
    return this.printJoin(nodes, parent, opts);
  }

  printList(
    items,
    parent,
    opts: { separator?: Function; indent?: boolean; statement?: boolean } = {},
  ) {
    if (opts.separator == null) {
      opts.separator = commaSeparator;
    }

    return this.printJoin(items, parent, opts);
  }

  _printNewline(leading, node, parent, opts) {
    // Fast path since 'this.newline' does nothing when not tracking lines.
    if (this.format.retainLines || this.format.compact) return;

    // Fast path for concise since 'this.newline' just inserts a space when
    // concise formatting is in use.
    if (this.format.concise) {
      this.space();
      return;
    }

    let lines = 0;
    // don't add newlines at the beginning of the file
    if (this._buf.hasContent()) {
      if (!leading) lines++; // always include at least a single line after
      if (opts.addNewlines) lines += opts.addNewlines(leading, node) || 0;

      const needs = leading ? n.needsWhitespaceBefore : n.needsWhitespaceAfter;
      if (needs(node, parent)) lines++;
    }

    this.newline(lines);
  }

  _getComments(leading, node) {
    // Note, we use a boolean flag here instead of passing in the attribute name as it is faster
    // because this is called extremely frequently.
    return (
      (node && (leading ? node.leadingComments : node.trailingComments)) || []
    );
  }

  _printComment(comment, skipNewLines?: boolean) {
    if (!this.format.shouldPrintComment(comment.value)) return;

    // Some plugins use this to mark comments as removed using the AST-root 'comments' property,
    // where they can't manually mutate the AST node comment lists.
    if (comment.ignore) return;

    if (this._printedComments.has(comment)) return;
    this._printedComments.add(comment);

    const isBlockComment = comment.type === "CommentBlock";

    // Add a newline before and after a block comment, unless explicitly
    // disallowed
    const printNewLines =
      isBlockComment && !skipNewLines && !this._noLineTerminator;

    if (printNewLines && this._buf.hasContent()) this.newline(1);

    if (!this.endsWith("[") && !this.endsWith("{")) this.space();

    let val =
      !isBlockComment && !this._noLineTerminator
        ? `//${comment.value}\n`
        : `/*${comment.value}*/`;

    if (isBlockComment && this.format.indent.adjustMultilineComment) {
      const offset = comment.loc?.start.column;
      if (offset) {
        const newlineRegex = new RegExp("\\n\\s{1," + offset + "}", "g");
        val = val.replace(newlineRegex, "\n");
      }

      const indentSize = Math.max(
        this._getIndent().length,
        this.format.retainLines ? 0 : this._buf.getCurrentColumn(),
      );
      val = val.replace(/\n(?!$)/g, `\n${" ".repeat(indentSize)}`);
    }

    // Avoid creating //* comments
    if (this.endsWith("/")) this._space();

    this.withSource("start", comment.loc, () => {
      this._append(val);
    });

    if (printNewLines) this.newline(1);
  }

  _printComments(comments?: Array<any>, inlinePureAnnotation?: boolean) {
    if (!comments?.length) return;

    if (
      inlinePureAnnotation &&
      comments.length === 1 &&
      PURE_ANNOTATION_RE.test(comments[0].value)
    ) {
      this._printComment(
        comments[0],
        // Keep newlines if the comment marks a standalone call
        this._buf.hasContent() && !this.endsWith("\n"),
      );
    } else {
      for (const comment of comments) {
        this._printComment(comment);
      }
    }
  }
  // todo(flow->ts): was Node
  printAssertions(node) {
    if (node.assertions?.length) {
      this.space();
      this.word("assert");
      this.space();
      this.token("{");
      this.space();
      this.printList(node.assertions, node);
      this.space();
      this.token("}");
    }
  }
}

// Expose the node type functions and helpers on the prototype for easy usage.
Object.assign(Printer.prototype, generatorFunctions);

if (!process.env.BABEL_8_BREAKING) {
  // @ts-ignore
  Printer.prototype.Noop = function Noop(this: Printer) {};
}

type GeneratorFunctions = typeof generatorFunctions;
interface Printer extends GeneratorFunctions {}
export default Printer;

function commaSeparator() {
  this.token(",");
  this.space();
}
