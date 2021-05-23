// @flow

// Error messages are colocated with the plugin.
/* eslint-disable @babel/development-internal/dry-error-messages */

import * as charCodes from "charcodes";

import XHTMLEntities from "./xhtml";
import type Parser from "../../parser";
import type { ExpressionErrors } from "../../parser/util";
import { TokenType, types as tt } from "../../tokenizer/types";
import { TokContext, types as tc } from "../../tokenizer/context";
import * as N from "../../types";
import { isIdentifierChar, isIdentifierStart } from "../../util/identifier";
import type { Position } from "../../util/location";
import { isNewLine } from "../../util/whitespace";
import { Errors, makeErrorTemplates, ErrorCodes } from "../../parser/error";

const HEX_NUMBER = /^[\da-fA-F]+$/;
const DECIMAL_NUMBER = /^\d+$/;

/* eslint sort-keys: "error" */
const JsxErrors = makeErrorTemplates(
  {
    AttributeIsEmpty:
      "JSX attributes must only be assigned a non-empty expression.",
    MissingClosingTagElement:
      "Expected corresponding JSX closing tag for <%0>.",
    MissingClosingTagFragment: "Expected corresponding JSX closing tag for <>.",
    UnexpectedSequenceExpression:
      "Sequence expressions cannot be directly nested inside JSX. Did you mean to wrap it in parentheses (...)?",
    UnsupportedJsxValue:
      "JSX value should be either an expression or a quoted JSX text.",
    UnterminatedJsxContent: "Unterminated JSX contents.",
    UnwrappedAdjacentJSXElements:
      "Adjacent JSX elements must be wrapped in an enclosing tag. Did you want a JSX fragment <>...</>?",
  },
  /* code */ ErrorCodes.SyntaxError,
);
/* eslint-disable sort-keys */

// Be aware that this file is always executed and not only when the plugin is enabled.
// Therefore this contexts and tokens do always exist.
tc.j_oTag = new TokContext("<tag", false);
tc.j_cTag = new TokContext("</tag", false);
tc.j_expr = new TokContext("<tag>...</tag>", true, true);

tt.jsxName = new TokenType("jsxName");
tt.jsxText = new TokenType("jsxText", { beforeExpr: true });
tt.jsxTagStart = new TokenType("jsxTagStart", { startsExpr: true });
tt.jsxTagEnd = new TokenType("jsxTagEnd");

tt.jsxTagStart.updateContext = function () {
  this.state.context.push(tc.j_expr); // treat as beginning of JSX expression
  this.state.context.push(tc.j_oTag); // start opening tag context
  this.state.exprAllowed = false;
};

tt.jsxTagEnd.updateContext = function (prevType) {
  const out = this.state.context.pop();
  if ((out === tc.j_oTag && prevType === tt.slash) || out === tc.j_cTag) {
    this.state.context.pop();
    this.state.exprAllowed = this.curContext() === tc.j_expr;
  } else {
    this.state.exprAllowed = true;
  }
};

function isFragment(object: ?N.JSXElement): boolean {
  return object
    ? object.type === "JSXOpeningFragment" ||
        object.type === "JSXClosingFragment"
    : false;
}

// Transforms JSX element name to string.

function getQualifiedJSXName(
  object: N.JSXIdentifier | N.JSXNamespacedName | N.JSXMemberExpression,
): string {
  if (object.type === "JSXIdentifier") {
    return object.name;
  }

  if (object.type === "JSXNamespacedName") {
    return object.namespace.name + ":" + object.name.name;
  }

  if (object.type === "JSXMemberExpression") {
    return (
      getQualifiedJSXName(object.object) +
      "." +
      getQualifiedJSXName(object.property)
    );
  }

  // istanbul ignore next
  throw new Error("Node had unexpected type: " + object.type);
}

export default (superClass: Class<Parser>): Class<Parser> =>
  class extends superClass {
    // Reads inline JSX contents token.

    jsxReadToken(): void {
      let out = "";
      let chunkStart = this.state.pos;
      for (;;) {
        if (this.state.pos >= this.length) {
          throw this.raise(this.state.start, JsxErrors.UnterminatedJsxContent);
        }

        const ch = this.input.charCodeAt(this.state.pos);

        switch (ch) {
          case charCodes.lessThan:
          case charCodes.leftCurlyBrace:
            if (this.state.pos === this.state.start) {
              if (ch === charCodes.lessThan && this.state.exprAllowed) {
                ++this.state.pos;
                return this.finishToken(tt.jsxTagStart);
              }
              return super.getTokenFromCode(ch);
            }
            out += this.input.slice(chunkStart, this.state.pos);
            return this.finishToken(tt.jsxText, out);

          case charCodes.ampersand:
            out += this.input.slice(chunkStart, this.state.pos);
            out += this.jsxReadEntity();
            chunkStart = this.state.pos;
            break;

          case charCodes.greaterThan:
          case charCodes.rightCurlyBrace:
            if (process.env.BABEL_8_BREAKING) {
              const htmlEntity =
                ch === charCodes.rightCurlyBrace ? "&rbrace;" : "&gt;";
              const char = this.input[this.state.pos];
              this.raise(this.state.pos, {
                code: ErrorCodes.SyntaxError,
                reasonCode: "UnexpectedToken",
                template: `Unexpected token \`${char}\`. Did you mean \`${htmlEntity}\` or \`{'${char}'}\`?`,
              });
            }
          /* falls through */

          default:
            if (isNewLine(ch)) {
              out += this.input.slice(chunkStart, this.state.pos);
              out += this.jsxReadNewLine(true);
              chunkStart = this.state.pos;
            } else {
              ++this.state.pos;
            }
        }
      }
    }

    jsxReadNewLine(normalizeCRLF: boolean): string {
      const ch = this.input.charCodeAt(this.state.pos);
      let out;
      ++this.state.pos;
      if (
        ch === charCodes.carriageReturn &&
        this.input.charCodeAt(this.state.pos) === charCodes.lineFeed
      ) {
        ++this.state.pos;
        out = normalizeCRLF ? "\n" : "\r\n";
      } else {
        out = String.fromCharCode(ch);
      }
      ++this.state.curLine;
      this.state.lineStart = this.state.pos;

      return out;
    }

    jsxReadString(quote: number): void {
      let out = "";
      let chunkStart = ++this.state.pos;
      for (;;) {
        if (this.state.pos >= this.length) {
          throw this.raise(this.state.start, Errors.UnterminatedString);
        }

        const ch = this.input.charCodeAt(this.state.pos);
        if (ch === quote) break;
        if (ch === charCodes.ampersand) {
          out += this.input.slice(chunkStart, this.state.pos);
          out += this.jsxReadEntity();
          chunkStart = this.state.pos;
        } else if (isNewLine(ch)) {
          out += this.input.slice(chunkStart, this.state.pos);
          out += this.jsxReadNewLine(false);
          chunkStart = this.state.pos;
        } else {
          ++this.state.pos;
        }
      }
      out += this.input.slice(chunkStart, this.state.pos++);
      return this.finishToken(tt.string, out);
    }

    jsxReadEntity(): string {
      let str = "";
      let count = 0;
      let entity;
      let ch = this.input[this.state.pos];

      const startPos = ++this.state.pos;
      while (this.state.pos < this.length && count++ < 10) {
        ch = this.input[this.state.pos++];
        if (ch === ";") {
          if (str[0] === "#") {
            if (str[1] === "x") {
              str = str.substr(2);
              if (HEX_NUMBER.test(str)) {
                entity = String.fromCodePoint(parseInt(str, 16));
              }
            } else {
              str = str.substr(1);
              if (DECIMAL_NUMBER.test(str)) {
                entity = String.fromCodePoint(parseInt(str, 10));
              }
            }
          } else {
            entity = XHTMLEntities[str];
          }
          break;
        }
        str += ch;
      }
      if (!entity) {
        this.state.pos = startPos;
        return "&";
      }
      return entity;
    }

    // Read a JSX identifier (valid tag or attribute name).
    //
    // Optimized version since JSX identifiers can"t contain
    // escape characters and so can be read as single slice.
    // Also assumes that first character was already checked
    // by isIdentifierStart in readToken.

    jsxReadWord(): void {
      let ch;
      const start = this.state.pos;
      do {
        ch = this.input.charCodeAt(++this.state.pos);
      } while (isIdentifierChar(ch) || ch === charCodes.dash);
      return this.finishToken(
        tt.jsxName,
        this.input.slice(start, this.state.pos),
      );
    }

    // Parse next token as JSX identifier

    jsxParseIdentifier(): N.JSXIdentifier {
      const node = this.startNode();
      if (this.match(tt.jsxName)) {
        node.name = this.state.value;
      } else if (this.state.type.keyword) {
        node.name = this.state.type.keyword;
      } else {
        this.unexpected();
      }
      this.next();
      return this.finishNode(node, "JSXIdentifier");
    }

    // Parse namespaced identifier.

    jsxParseNamespacedName(): N.JSXNamespacedName {
      const startPos = this.state.start;
      const startLoc = this.state.startLoc;
      const name = this.jsxParseIdentifier();
      if (!this.eat(tt.colon)) return name;

      const node = this.startNodeAt(startPos, startLoc);
      node.namespace = name;
      node.name = this.jsxParseIdentifier();
      return this.finishNode(node, "JSXNamespacedName");
    }

    // Parses element name in any form - namespaced, member
    // or single identifier.

    jsxParseElementName():
      | N.JSXIdentifier
      | N.JSXNamespacedName
      | N.JSXMemberExpression {
      const startPos = this.state.start;
      const startLoc = this.state.startLoc;
      let node = this.jsxParseNamespacedName();
      if (node.type === "JSXNamespacedName") {
        return node;
      }
      while (this.eat(tt.dot)) {
        const newNode = this.startNodeAt(startPos, startLoc);
        newNode.object = node;
        newNode.property = this.jsxParseIdentifier();
        node = this.finishNode(newNode, "JSXMemberExpression");
      }
      return node;
    }

    // Parses any type of JSX attribute value.

    jsxParseAttributeValue(): N.Expression {
      let node;
      switch (this.state.type) {
        case tt.braceL:
          node = this.startNode();
          this.next();
          node = this.jsxParseExpressionContainer(node);
          if (node.expression.type === "JSXEmptyExpression") {
            this.raise(node.start, JsxErrors.AttributeIsEmpty);
          }
          return node;

        case tt.jsxTagStart:
        case tt.string:
          return this.parseExprAtom();

        default:
          throw this.raise(this.state.start, JsxErrors.UnsupportedJsxValue);
      }
    }

    // JSXEmptyExpression is unique type since it doesn't actually parse anything,
    // and so it should start at the end of last read token (left brace) and finish
    // at the beginning of the next one (right brace).

    jsxParseEmptyExpression(): N.JSXEmptyExpression {
      const node = this.startNodeAt(
        this.state.lastTokEnd,
        this.state.lastTokEndLoc,
      );
      return this.finishNodeAt(
        node,
        "JSXEmptyExpression",
        this.state.start,
        this.state.startLoc,
      );
    }

    // Parse JSX spread child

    jsxParseSpreadChild(node: N.JSXSpreadChild): N.JSXSpreadChild {
      this.next(); // ellipsis
      node.expression = this.parseExpression();
      this.expect(tt.braceR);

      return this.finishNode(node, "JSXSpreadChild");
    }

    // Parses JSX expression enclosed into curly brackets.

    jsxParseExpressionContainer(
      node: N.JSXExpressionContainer,
    ): N.JSXExpressionContainer {
      if (this.match(tt.braceR)) {
        node.expression = this.jsxParseEmptyExpression();
      } else {
        const expression = this.parseExpression();

        if (process.env.BABEL_8_BREAKING) {
          if (
            expression.type === "SequenceExpression" &&
            !expression.extra?.parenthesized
          ) {
            this.raise(
              expression.expressions[1].start,
              JsxErrors.UnexpectedSequenceExpression,
            );
          }
        }

        node.expression = expression;
      }
      this.expect(tt.braceR);

      return this.finishNode(node, "JSXExpressionContainer");
    }

    // Parses following JSX attribute name-value pair.

    jsxParseAttribute(): N.JSXAttribute {
      const node = this.startNode();
      if (this.eat(tt.braceL)) {
        this.expect(tt.ellipsis);
        node.argument = this.parseMaybeAssignAllowIn();
        this.expect(tt.braceR);
        return this.finishNode(node, "JSXSpreadAttribute");
      }
      node.name = this.jsxParseNamespacedName();
      node.value = this.eat(tt.eq) ? this.jsxParseAttributeValue() : null;
      return this.finishNode(node, "JSXAttribute");
    }

    // Parses JSX opening tag starting after "<".

    jsxParseOpeningElementAt(
      startPos: number,
      startLoc: Position,
    ): N.JSXOpeningElement {
      const node = this.startNodeAt(startPos, startLoc);
      if (this.match(tt.jsxTagEnd)) {
        this.expect(tt.jsxTagEnd);
        return this.finishNode(node, "JSXOpeningFragment");
      }
      node.name = this.jsxParseElementName();
      return this.jsxParseOpeningElementAfterName(node);
    }

    jsxParseOpeningElementAfterName(
      node: N.JSXOpeningElement,
    ): N.JSXOpeningElement {
      const attributes: N.JSXAttribute[] = [];
      while (!this.match(tt.slash) && !this.match(tt.jsxTagEnd)) {
        attributes.push(this.jsxParseAttribute());
      }
      node.attributes = attributes;
      node.selfClosing = this.eat(tt.slash);
      this.expect(tt.jsxTagEnd);
      return this.finishNode(node, "JSXOpeningElement");
    }

    // Parses JSX closing tag starting after "</".

    jsxParseClosingElementAt(
      startPos: number,
      startLoc: Position,
    ): N.JSXClosingElement {
      const node = this.startNodeAt(startPos, startLoc);
      if (this.match(tt.jsxTagEnd)) {
        this.expect(tt.jsxTagEnd);
        return this.finishNode(node, "JSXClosingFragment");
      }
      node.name = this.jsxParseElementName();
      this.expect(tt.jsxTagEnd);
      return this.finishNode(node, "JSXClosingElement");
    }

    // Parses entire JSX element, including it"s opening tag
    // (starting after "<"), attributes, contents and closing tag.

    jsxParseElementAt(startPos: number, startLoc: Position): N.JSXElement {
      const node = this.startNodeAt(startPos, startLoc);
      const children = [];
      const openingElement = this.jsxParseOpeningElementAt(startPos, startLoc);
      let closingElement = null;

      if (!openingElement.selfClosing) {
        contents: for (;;) {
          switch (this.state.type) {
            case tt.jsxTagStart:
              startPos = this.state.start;
              startLoc = this.state.startLoc;
              this.next();
              if (this.eat(tt.slash)) {
                closingElement = this.jsxParseClosingElementAt(
                  startPos,
                  startLoc,
                );
                break contents;
              }
              children.push(this.jsxParseElementAt(startPos, startLoc));
              break;

            case tt.jsxText:
              children.push(this.parseExprAtom());
              break;

            case tt.braceL: {
              const node = this.startNode();
              this.next();
              if (this.match(tt.ellipsis)) {
                children.push(this.jsxParseSpreadChild(node));
              } else {
                children.push(this.jsxParseExpressionContainer(node));
              }

              break;
            }
            // istanbul ignore next - should never happen
            default:
              throw this.unexpected();
          }
        }

        if (isFragment(openingElement) && !isFragment(closingElement)) {
          this.raise(
            // $FlowIgnore
            closingElement.start,
            JsxErrors.MissingClosingTagFragment,
          );
        } else if (!isFragment(openingElement) && isFragment(closingElement)) {
          this.raise(
            // $FlowIgnore
            closingElement.start,
            JsxErrors.MissingClosingTagElement,
            getQualifiedJSXName(openingElement.name),
          );
        } else if (!isFragment(openingElement) && !isFragment(closingElement)) {
          if (
            // $FlowIgnore
            getQualifiedJSXName(closingElement.name) !==
            getQualifiedJSXName(openingElement.name)
          ) {
            this.raise(
              // $FlowIgnore
              closingElement.start,
              JsxErrors.MissingClosingTagElement,
              getQualifiedJSXName(openingElement.name),
            );
          }
        }
      }

      if (isFragment(openingElement)) {
        node.openingFragment = openingElement;
        node.closingFragment = closingElement;
      } else {
        node.openingElement = openingElement;
        node.closingElement = closingElement;
      }
      node.children = children;
      if (this.isRelational("<")) {
        throw this.raise(
          this.state.start,
          JsxErrors.UnwrappedAdjacentJSXElements,
        );
      }

      return isFragment(openingElement)
        ? this.finishNode(node, "JSXFragment")
        : this.finishNode(node, "JSXElement");
    }

    // Parses entire JSX element from current position.

    jsxParseElement(): N.JSXElement {
      const startPos = this.state.start;
      const startLoc = this.state.startLoc;
      this.next();
      return this.jsxParseElementAt(startPos, startLoc);
    }

    // ==================================
    // Overrides
    // ==================================

    parseExprAtom(refExpressionErrors: ?ExpressionErrors): N.Expression {
      if (this.match(tt.jsxText)) {
        return this.parseLiteral(this.state.value, "JSXText");
      } else if (this.match(tt.jsxTagStart)) {
        return this.jsxParseElement();
      } else if (
        this.isRelational("<") &&
        this.input.charCodeAt(this.state.pos) !== charCodes.exclamationMark
      ) {
        // In case we encounter an lt token here it will always be the start of
        // jsx as the lt sign is not allowed in places that expect an expression
        this.finishToken(tt.jsxTagStart);
        return this.jsxParseElement();
      } else {
        return super.parseExprAtom(refExpressionErrors);
      }
    }

    getTokenFromCode(code: number): void {
      if (this.state.inPropertyName) return super.getTokenFromCode(code);

      const context = this.curContext();

      if (context === tc.j_expr) {
        return this.jsxReadToken();
      }

      if (context === tc.j_oTag || context === tc.j_cTag) {
        if (isIdentifierStart(code)) {
          return this.jsxReadWord();
        }

        if (code === charCodes.greaterThan) {
          ++this.state.pos;
          return this.finishToken(tt.jsxTagEnd);
        }

        if (
          (code === charCodes.quotationMark || code === charCodes.apostrophe) &&
          context === tc.j_oTag
        ) {
          return this.jsxReadString(code);
        }
      }

      if (
        code === charCodes.lessThan &&
        this.state.exprAllowed &&
        this.input.charCodeAt(this.state.pos + 1) !== charCodes.exclamationMark
      ) {
        ++this.state.pos;
        return this.finishToken(tt.jsxTagStart);
      }

      return super.getTokenFromCode(code);
    }

    updateContext(prevType: TokenType): void {
      if (this.match(tt.braceL)) {
        const curContext = this.curContext();
        if (curContext === tc.j_oTag) {
          this.state.context.push(tc.braceExpression);
        } else if (curContext === tc.j_expr) {
          this.state.context.push(tc.templateQuasi);
        } else {
          super.updateContext(prevType);
        }
        this.state.exprAllowed = true;
      } else if (this.match(tt.slash) && prevType === tt.jsxTagStart) {
        this.state.context.length -= 2; // do not consider JSX expr -> JSX open tag -> ... anymore
        this.state.context.push(tc.j_cTag); // reconsider as closing tag context
        this.state.exprAllowed = false;
      } else {
        return super.updateContext(prevType);
      }
    }
  };
