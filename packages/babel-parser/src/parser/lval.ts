// @flow

/*:: declare var invariant; */
import * as charCodes from "charcodes";
import { types as tt, type TokenType } from "../tokenizer/types";
import type {
  TSParameterProperty,
  Decorator,
  Expression,
  Node,
  Pattern,
  RestElement,
  SpreadElement,
  /*:: Identifier, */
  /*:: ObjectExpression, */
  /*:: ObjectPattern, */
} from "../types";
import type { Pos, Position } from "../util/location";
import {
  isStrictBindOnlyReservedWord,
  isStrictBindReservedWord,
} from "../util/identifier";
import { NodeUtils } from "./node";
import { type BindingTypes, BIND_NONE } from "../util/scopeflags";
import { ExpressionErrors } from "./util";
import { Errors } from "./error";

const unwrapParenthesizedExpression = (node: Node): Node => {
  return node.type === "ParenthesizedExpression"
    ? unwrapParenthesizedExpression(node.expression)
    : node;
};

export default class LValParser extends NodeUtils {
  // Forward-declaration: defined in expression.js
  /*::
  +parseIdentifier: (liberal?: boolean) => Identifier;
  +parseMaybeAssignAllowIn: (
    refExpressionErrors?: ?ExpressionErrors,
    afterLeftParse?: Function,
    refNeedsArrowPos?: ?Pos,
  ) => Expression;
  +parseObjectLike: <T: ObjectPattern | ObjectExpression>(
    close: TokenType,
    isPattern: boolean,
    isRecord?: ?boolean,
    refExpressionErrors?: ?ExpressionErrors,
  ) => T;
  */
  // Forward-declaration: defined in statement.js
  /*::
  +parseDecorator: () => Decorator;
  */

  /**
   * Convert existing expression atom to assignable pattern
   * if possible. Also checks invalid destructuring targets:

   - Parenthesized Destructuring patterns
   - RestElement is not the last element
   - Missing `=` in assignment pattern

   NOTE: There is a corresponding "isAssignable" method in flow.js.
   When this one is updated, please check if also that one needs to be updated.

   * @param {Node} node The expression atom
   * @param {boolean} [isLHS=false] Whether we are parsing a LeftHandSideExpression. If isLHS is `true`, the following cases are allowed:
                                    `[(a)] = [0]`, `[(a.b)] = [0]`

   * @returns {Node} The converted assignable pattern
   * @memberof LValParser
   */
  toAssignable(node: Node, isLHS: boolean = false): Node {
    let parenthesized = undefined;
    if (node.type === "ParenthesizedExpression" || node.extra?.parenthesized) {
      parenthesized = unwrapParenthesizedExpression(node);
      if (isLHS) {
        // an LHS can be reinterpreted to a binding pattern but not vice versa.
        // therefore a parenthesized identifier is ambiguous until we are sure it is an assignment expression
        // i.e. `([(a) = []] = []) => {}`
        // see also `recordParenthesizedIdentifierError` signature in packages/babel-parser/src/util/expression-scope.js
        if (parenthesized.type === "Identifier") {
          this.expressionScope.recordParenthesizedIdentifierError(
            node.start,
            Errors.InvalidParenthesizedAssignment,
          );
        } else if (parenthesized.type !== "MemberExpression") {
          // A parenthesized member expression can be in LHS but not in pattern.
          // If the LHS is later interpreted as a pattern, `checkLVal` will throw for member expression binding
          // i.e. `([(a.b) = []] = []) => {}`
          this.raise(node.start, Errors.InvalidParenthesizedAssignment);
        }
      } else {
        this.raise(node.start, Errors.InvalidParenthesizedAssignment);
      }
    }

    switch (node.type) {
      case "Identifier":
      case "ObjectPattern":
      case "ArrayPattern":
      case "AssignmentPattern":
        break;

      case "ObjectExpression":
        node.type = "ObjectPattern";
        for (
          let i = 0, length = node.properties.length, last = length - 1;
          i < length;
          i++
        ) {
          const prop = node.properties[i];
          const isLast = i === last;
          this.toAssignableObjectExpressionProp(prop, isLast, isLHS);

          if (
            isLast &&
            prop.type === "RestElement" &&
            node.extra?.trailingComma
          ) {
            this.raiseRestNotLast(node.extra.trailingComma);
          }
        }
        break;

      case "ObjectProperty":
        this.toAssignable(node.value, isLHS);
        break;

      case "SpreadElement": {
        this.checkToRestConversion(node);

        node.type = "RestElement";
        const arg = node.argument;
        this.toAssignable(arg, isLHS);
        break;
      }

      case "ArrayExpression":
        node.type = "ArrayPattern";
        this.toAssignableList(node.elements, node.extra?.trailingComma, isLHS);
        break;

      case "AssignmentExpression":
        if (node.operator !== "=") {
          this.raise(node.left.end, Errors.MissingEqInAssignment);
        }

        node.type = "AssignmentPattern";
        delete node.operator;
        this.toAssignable(node.left, isLHS);
        break;

      case "ParenthesizedExpression":
        /*::invariant (parenthesized !== undefined) */
        this.toAssignable(parenthesized, isLHS);
        break;

      default:
      // We don't know how to deal with this node. It will
      // be reported by a later call to checkLVal
    }
    return node;
  }

  toAssignableObjectExpressionProp(
    prop: Node,
    isLast: boolean,
    isLHS: boolean,
  ) {
    if (prop.type === "ObjectMethod") {
      const error =
        prop.kind === "get" || prop.kind === "set"
          ? Errors.PatternHasAccessor
          : Errors.PatternHasMethod;

      /* eslint-disable @babel/development-internal/dry-error-messages */
      this.raise(prop.key.start, error);
      /* eslint-enable @babel/development-internal/dry-error-messages */
    } else if (prop.type === "SpreadElement" && !isLast) {
      this.raiseRestNotLast(prop.start);
    } else {
      this.toAssignable(prop, isLHS);
    }
  }

  // Convert list of expression atoms to binding list.

  toAssignableList(
    exprList: Expression[],
    trailingCommaPos?: ?number,
    isLHS: boolean,
  ): $ReadOnlyArray<Pattern> {
    let end = exprList.length;
    if (end) {
      const last = exprList[end - 1];
      if (last?.type === "RestElement") {
        --end;
      } else if (last?.type === "SpreadElement") {
        last.type = "RestElement";
        let arg = last.argument;
        this.toAssignable(arg, isLHS);
        arg = unwrapParenthesizedExpression(arg);
        if (
          arg.type !== "Identifier" &&
          arg.type !== "MemberExpression" &&
          arg.type !== "ArrayPattern" &&
          arg.type !== "ObjectPattern"
        ) {
          this.unexpected(arg.start);
        }

        if (trailingCommaPos) {
          this.raiseTrailingCommaAfterRest(trailingCommaPos);
        }

        --end;
      }
    }
    for (let i = 0; i < end; i++) {
      const elt = exprList[i];
      if (elt) {
        this.toAssignable(elt, isLHS);
        if (elt.type === "RestElement") {
          this.raiseRestNotLast(elt.start);
        }
      }
    }
    return exprList;
  }

  // Convert list of expression atoms to a list of

  toReferencedList(
    exprList: $ReadOnlyArray<?Expression>,
    isParenthesizedExpr?: boolean, // eslint-disable-line no-unused-vars
  ): $ReadOnlyArray<?Expression> {
    return exprList;
  }

  toReferencedListDeep(
    exprList: $ReadOnlyArray<?Expression>,
    isParenthesizedExpr?: boolean,
  ): void {
    this.toReferencedList(exprList, isParenthesizedExpr);

    for (const expr of exprList) {
      if (expr?.type === "ArrayExpression") {
        this.toReferencedListDeep(expr.elements);
      }
    }
  }

  // Parses spread element.

  parseSpread(
    refExpressionErrors: ?ExpressionErrors,
    refNeedsArrowPos?: ?Pos,
  ): SpreadElement {
    const node = this.startNode();
    this.next();
    node.argument = this.parseMaybeAssignAllowIn(
      refExpressionErrors,
      undefined,
      refNeedsArrowPos,
    );
    return this.finishNode(node, "SpreadElement");
  }

  // https://tc39.es/ecma262/#prod-BindingRestProperty
  // https://tc39.es/ecma262/#prod-BindingRestElement
  parseRestBinding(): RestElement {
    const node = this.startNode();
    this.next(); // eat `...`
    node.argument = this.parseBindingAtom();
    return this.finishNode(node, "RestElement");
  }

  // Parses lvalue (assignable) atom.
  parseBindingAtom(): Pattern {
    // https://tc39.es/ecma262/#prod-BindingPattern
    switch (this.state.type) {
      case tt.bracketL: {
        const node = this.startNode();
        this.next();
        node.elements = this.parseBindingList(
          tt.bracketR,
          charCodes.rightSquareBracket,
          true,
        );
        return this.finishNode(node, "ArrayPattern");
      }

      case tt.braceL:
        return this.parseObjectLike(tt.braceR, true);
    }

    // https://tc39.es/ecma262/#prod-BindingIdentifier
    return this.parseIdentifier();
  }

  // https://tc39.es/ecma262/#prod-BindingElementList
  parseBindingList(
    close: TokenType,
    closeCharCode: $Values<typeof charCodes>,
    allowEmpty?: boolean,
    allowModifiers?: boolean,
  ): $ReadOnlyArray<Pattern | TSParameterProperty> {
    const elts: Array<Pattern | TSParameterProperty> = [];
    let first = true;
    while (!this.eat(close)) {
      if (first) {
        first = false;
      } else {
        this.expect(tt.comma);
      }
      if (allowEmpty && this.match(tt.comma)) {
        // $FlowFixMe This method returns `$ReadOnlyArray<?Pattern>` if `allowEmpty` is set.
        elts.push(null);
      } else if (this.eat(close)) {
        break;
      } else if (this.match(tt.ellipsis)) {
        elts.push(this.parseAssignableListItemTypes(this.parseRestBinding()));
        this.checkCommaAfterRest(closeCharCode);
        this.expect(close);
        break;
      } else {
        const decorators = [];
        if (this.match(tt.at) && this.hasPlugin("decorators")) {
          this.raise(this.state.start, Errors.UnsupportedParameterDecorator);
        }
        // invariant: hasPlugin("decorators-legacy")
        while (this.match(tt.at)) {
          decorators.push(this.parseDecorator());
        }
        elts.push(this.parseAssignableListItem(allowModifiers, decorators));
      }
    }
    return elts;
  }

  parseAssignableListItem(
    allowModifiers: ?boolean,
    decorators: Decorator[],
  ): Pattern | TSParameterProperty {
    const left = this.parseMaybeDefault();
    this.parseAssignableListItemTypes(left);
    const elt = this.parseMaybeDefault(left.start, left.loc.start, left);
    if (decorators.length) {
      left.decorators = decorators;
    }
    return elt;
  }

  // Used by flow/typescript plugin to add type annotations to binding elements
  parseAssignableListItemTypes(param: Pattern): Pattern {
    return param;
  }

  // Parses assignment pattern around given atom if possible.
  // https://tc39.es/ecma262/#prod-BindingElement
  parseMaybeDefault(
    startPos?: ?number,
    startLoc?: ?Position,
    left?: ?Pattern,
  ): Pattern {
    startLoc = startLoc ?? this.state.startLoc;
    startPos = startPos ?? this.state.start;
    // $FlowIgnore
    left = left ?? this.parseBindingAtom();
    if (!this.eat(tt.eq)) return left;

    const node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.right = this.parseMaybeAssignAllowIn();
    return this.finishNode(node, "AssignmentPattern");
  }

  /**
   * Verify that if a node is an lval - something that can be assigned to.
   *
   * @param {Expression} expr The given node
   * @param {string} contextDescription The auxiliary context information printed when error is thrown
   * @param {BindingTypes} [bindingType=BIND_NONE] The desired binding type. If the given node is an identifier and `bindingType` is not
                                                   BIND_NONE, `checkLVal` will register binding to the parser scope
                                                   See also src/util/scopeflags.js
   * @param {?Set<string>} checkClashes An optional string set to check if an identifier name is included. `checkLVal` will add checked
                                        identifier name to `checkClashes` It is used in tracking duplicates in function parameter lists. If
                                        it is nullish, `checkLVal` will skip duplicate checks
   * @param {boolean} [disallowLetBinding] Whether an identifier named "let" should be disallowed
   * @param {boolean} [strictModeChanged=false] Whether an identifier has been parsed in a sloppy context but should be reinterpreted as
                                                strict-mode. e.g. `(arguments) => { "use strict "}`
   * @memberof LValParser
   */
  checkLVal(
    expr: Expression,
    contextDescription: string,
    bindingType: BindingTypes = BIND_NONE,
    checkClashes: ?Set<string>,
    disallowLetBinding?: boolean,
    strictModeChanged?: boolean = false,
  ): void {
    switch (expr.type) {
      case "Identifier": {
        const { name } = expr;
        if (
          this.state.strict &&
          // "Global" reserved words have already been checked by parseIdentifier,
          // unless they have been found in the id or parameters of a strict-mode
          // function in a sloppy context.
          (strictModeChanged
            ? isStrictBindReservedWord(name, this.inModule)
            : isStrictBindOnlyReservedWord(name))
        ) {
          this.raise(
            expr.start,
            bindingType === BIND_NONE
              ? Errors.StrictEvalArguments
              : Errors.StrictEvalArgumentsBinding,
            name,
          );
        }

        if (checkClashes) {
          if (checkClashes.has(name)) {
            this.raise(expr.start, Errors.ParamDupe);
          } else {
            checkClashes.add(name);
          }
        }
        if (disallowLetBinding && name === "let") {
          this.raise(expr.start, Errors.LetInLexicalBinding);
        }
        if (!(bindingType & BIND_NONE)) {
          this.scope.declareName(name, bindingType, expr.start);
        }
        break;
      }

      case "MemberExpression":
        if (bindingType !== BIND_NONE) {
          this.raise(expr.start, Errors.InvalidPropertyBindingPattern);
        }
        break;

      case "ObjectPattern":
        for (let prop of expr.properties) {
          if (this.isObjectProperty(prop)) prop = prop.value;
          // If we find here an ObjectMethod, it's because this was originally
          // an ObjectExpression which has then been converted.
          // toAssignable already reported this error with a nicer message.
          else if (this.isObjectMethod(prop)) continue;

          this.checkLVal(
            prop,
            "object destructuring pattern",
            bindingType,
            checkClashes,
            disallowLetBinding,
          );
        }
        break;

      case "ArrayPattern":
        for (const elem of expr.elements) {
          if (elem) {
            this.checkLVal(
              elem,
              "array destructuring pattern",
              bindingType,
              checkClashes,
              disallowLetBinding,
            );
          }
        }
        break;

      case "AssignmentPattern":
        this.checkLVal(
          expr.left,
          "assignment pattern",
          bindingType,
          checkClashes,
        );
        break;

      case "RestElement":
        this.checkLVal(
          expr.argument,
          "rest element",
          bindingType,
          checkClashes,
        );
        break;

      case "ParenthesizedExpression":
        this.checkLVal(
          expr.expression,
          "parenthesized expression",
          bindingType,
          checkClashes,
        );
        break;

      default: {
        this.raise(
          expr.start,
          bindingType === BIND_NONE
            ? Errors.InvalidLhs
            : Errors.InvalidLhsBinding,
          contextDescription,
        );
      }
    }
  }

  checkToRestConversion(node: SpreadElement): void {
    if (
      node.argument.type !== "Identifier" &&
      node.argument.type !== "MemberExpression"
    ) {
      this.raise(node.argument.start, Errors.InvalidRestAssignmentPattern);
    }
  }

  checkCommaAfterRest(close: $Values<typeof charCodes>): void {
    if (this.match(tt.comma)) {
      if (this.lookaheadCharCode() === close) {
        this.raiseTrailingCommaAfterRest(this.state.start);
      } else {
        this.raiseRestNotLast(this.state.start);
      }
    }
  }

  raiseRestNotLast(pos: number) {
    throw this.raise(pos, Errors.ElementAfterRest);
  }

  raiseTrailingCommaAfterRest(pos: number) {
    this.raise(pos, Errors.RestTrailingComma);
  }
}
