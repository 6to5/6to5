// @flow

import { types as tt, TokenType } from "../tokenizer/types";
import type Parser from "../parser";
import type { ExpressionErrors } from "../parser/util";
import * as N from "../types";
import type { Position } from "../util/location";
import { type BindingTypes } from "../util/scopeflags";
import { Errors } from "../parser/error";

function isSimpleProperty(node: N.Node): boolean {
  return (
    node != null &&
    node.type === "Property" &&
    node.kind === "init" &&
    node.method === false
  );
}

export default (superClass: Class<Parser>): Class<Parser> =>
  class extends superClass {
    estreeParseRegExpLiteral({ pattern, flags }: N.RegExpLiteral): N.Node {
      let regex = null;
      try {
        regex = new RegExp(pattern, flags);
      } catch (e) {
        // In environments that don't support these flags value will
        // be null as the regex can't be represented natively.
      }
      const node = this.estreeParseLiteral(regex);
      node.regex = { pattern, flags };

      return node;
    }

    estreeParseBigIntLiteral(value: any): N.Node {
      // https://github.com/estree/estree/blob/master/es2020.md#bigintliteral
      let bigInt;
      try {
        // $FlowIgnore
        bigInt = BigInt(value);
      } catch {
        bigInt = null;
      }
      const node = this.estreeParseLiteral(bigInt);
      node.bigint = String(node.value || value);

      return node;
    }

    estreeParseDecimalLiteral(value: any): N.Node {
      // https://github.com/estree/estree/blob/master/experimental/decimal.md
      // todo: use BigDecimal when node supports it.
      const decimal = null;
      const node = this.estreeParseLiteral(decimal);
      node.decimal = String(node.value || value);

      return node;
    }

    estreeParseLiteral(value: any): N.Node {
      return this.parseLiteral(value, "Literal");
    }

    directiveToStmt(directive: N.Directive): N.ExpressionStatement {
      const directiveLiteral = directive.value;

      const stmt = this.startNodeAt(directive.start, directive.loc.start);
      const expression = this.startNodeAt(
        directiveLiteral.start,
        directiveLiteral.loc.start,
      );

      expression.value = directiveLiteral.value;
      expression.raw = directiveLiteral.extra.raw;

      stmt.expression = this.finishNodeAt(
        expression,
        "Literal",
        directiveLiteral.end,
        directiveLiteral.loc.end,
      );
      stmt.directive = directiveLiteral.extra.raw.slice(1, -1);

      return this.finishNodeAt(
        stmt,
        "ExpressionStatement",
        directive.end,
        directive.loc.end,
      );
    }

    // ==================================
    // Overrides
    // ==================================

    initFunction(
      node: N.BodilessFunctionOrMethodBase,
      isAsync: ?boolean,
    ): void {
      super.initFunction(node, isAsync);
      node.expression = false;
    }

    checkDeclaration(node: N.Pattern | N.ObjectProperty): void {
      if (isSimpleProperty(node)) {
        this.checkDeclaration(((node: any): N.EstreeProperty).value);
      } else {
        super.checkDeclaration(node);
      }
    }

    getObjectOrClassMethodParams(method: N.ObjectMethod | N.ClassMethod) {
      return ((method: any): N.EstreeProperty | N.EstreeMethodDefinition).value
        .params;
    }

    checkLVal(
      expr: N.Expression,
      contextDescription: string,
      ...args: [
        BindingTypes | void,
        ?Set<string>,
        boolean | void,
        boolean | void,
      ]
    ): void {
      switch (expr.type) {
        case "ObjectPattern":
          expr.properties.forEach(prop => {
            // If we find here a method or accessor, it's because this was originally
            // an ObjectExpression which has then been converted.
            // toAssignable already reported this error with a nicer message.
            if (prop.kind === "get" || prop.kind === "set" || prop.method) {
              return;
            }
            this.checkLVal(
              prop.type === "Property" ? prop.value : prop,
              "object destructuring pattern",
              ...args,
            );
          });
          break;
        default:
          super.checkLVal(expr, contextDescription, ...args);
      }
    }

    checkProto(
      prop: N.ObjectMember | N.SpreadElement,
      isRecord: boolean,
      protoRef: { used: boolean },
      refExpressionErrors: ?ExpressionErrors,
    ): void {
      // $FlowIgnore: check prop.method and fallback to super method
      if (prop.method) {
        return;
      }
      super.checkProto(prop, isRecord, protoRef, refExpressionErrors);
    }

    isValidDirective(stmt: N.Statement): boolean {
      return (
        stmt.type === "ExpressionStatement" &&
        stmt.expression.type === "Literal" &&
        typeof stmt.expression.value === "string" &&
        !stmt.expression.extra?.parenthesized
      );
    }

    stmtToDirective(stmt: N.Statement): N.Directive {
      const directive = super.stmtToDirective(stmt);
      const value = stmt.expression.value;

      // Reset value to the actual value as in estree mode we want
      // the stmt to have the real value and not the raw value
      directive.value.value = value;

      return directive;
    }

    parseBlockBody(
      node: N.BlockStatementLike,
      ...args: [?boolean, boolean, TokenType, void | (boolean => void)]
    ): void {
      super.parseBlockBody(node, ...args);

      const directiveStatements = node.directives.map(d =>
        this.directiveToStmt(d),
      );
      node.body = directiveStatements.concat(node.body);
      // $FlowIgnore - directives isn't optional in the type definition
      delete node.directives;
    }

    pushClassMethod(
      classBody: N.ClassBody,
      method: N.ClassMethod,
      isGenerator: boolean,
      isAsync: boolean,
      isConstructor: boolean,
      allowsDirectSuper: boolean,
    ): void {
      this.parseMethod(
        method,
        isGenerator,
        isAsync,
        isConstructor,
        allowsDirectSuper,
        "ClassMethod",
        true,
      );
      if (method.typeParameters) {
        // $FlowIgnore
        method.value.typeParameters = method.typeParameters;
        delete method.typeParameters;
      }
      classBody.body.push(method);
    }

    parseExprAtom(refExpressionErrors?: ?ExpressionErrors): N.Expression {
      switch (this.state.type) {
        case tt.num:
        case tt.string:
          return this.estreeParseLiteral(this.state.value);

        case tt.regexp:
          return this.estreeParseRegExpLiteral(this.state.value);

        case tt.bigint:
          return this.estreeParseBigIntLiteral(this.state.value);

        case tt.decimal:
          return this.estreeParseDecimalLiteral(this.state.value);

        case tt._null:
          return this.estreeParseLiteral(null);

        case tt._true:
          return this.estreeParseLiteral(true);

        case tt._false:
          return this.estreeParseLiteral(false);

        default:
          return super.parseExprAtom(refExpressionErrors);
      }
    }

    parseLiteral<T: N.Literal>(
      value: any,
      type: /*T["kind"]*/ string,
      startPos?: number,
      startLoc?: Position,
    ): T {
      const node = super.parseLiteral(value, type, startPos, startLoc);
      node.raw = node.extra.raw;
      delete node.extra;

      return node;
    }

    parseFunctionBody(
      node: N.Function,
      allowExpression: ?boolean,
      isMethod?: boolean = false,
    ): void {
      super.parseFunctionBody(node, allowExpression, isMethod);
      node.expression = node.body.type !== "BlockStatement";
    }

    parseMethod<T: N.MethodLike>(
      node: T,
      isGenerator: boolean,
      isAsync: boolean,
      isConstructor: boolean,
      allowDirectSuper: boolean,
      type: string,
      inClassScope: boolean = false,
    ): T {
      let funcNode = this.startNode();
      funcNode.kind = node.kind; // provide kind, so super method correctly sets state
      funcNode = super.parseMethod(
        funcNode,
        isGenerator,
        isAsync,
        isConstructor,
        allowDirectSuper,
        type,
        inClassScope,
      );
      funcNode.type = "FunctionExpression";
      delete funcNode.kind;
      // $FlowIgnore
      node.value = funcNode;

      type = type === "ClassMethod" ? "MethodDefinition" : type;
      return this.finishNode(node, type);
    }

    parseObjectMethod(
      prop: N.ObjectMethod,
      isGenerator: boolean,
      isAsync: boolean,
      isPattern: boolean,
      isAccessor: boolean,
    ): ?N.ObjectMethod {
      const node: N.EstreeProperty = (super.parseObjectMethod(
        prop,
        isGenerator,
        isAsync,
        isPattern,
        isAccessor,
      ): any);

      if (node) {
        node.type = "Property";
        if (((node: any): N.ClassMethod).kind === "method") node.kind = "init";
        node.shorthand = false;
      }

      return (node: any);
    }

    parseObjectProperty(
      prop: N.ObjectProperty,
      startPos: ?number,
      startLoc: ?Position,
      isPattern: boolean,
      refExpressionErrors: ?ExpressionErrors,
    ): ?N.ObjectProperty {
      const node: N.EstreeProperty = (super.parseObjectProperty(
        prop,
        startPos,
        startLoc,
        isPattern,
        refExpressionErrors,
      ): any);

      if (node) {
        node.kind = "init";
        node.type = "Property";
      }

      return (node: any);
    }

    toAssignable(node: N.Node, isLHS: boolean = false): N.Node {
      if (isSimpleProperty(node)) {
        this.toAssignable(node.value);

        return node;
      }

      return super.toAssignable(node, isLHS);
    }

    toAssignableObjectExpressionProp(prop: N.Node, ...args) {
      if (prop.kind === "get" || prop.kind === "set") {
        this.raise(prop.key.start, Errors.PatternHasAccessor);
      } else if (prop.method) {
        this.raise(prop.key.start, Errors.PatternHasMethod);
      } else {
        super.toAssignableObjectExpressionProp(prop, ...args);
      }
    }

    finishCallExpression<T: N.CallExpression | N.OptionalCallExpression>(
      node: T,
      optional: boolean,
    ): N.Expression {
      super.finishCallExpression(node, optional);

      if (node.callee.type === "Import") {
        ((node: N.Node): N.EstreeImportExpression).type = "ImportExpression";
        ((node: N.Node): N.EstreeImportExpression).source = node.arguments[0];
        // $FlowIgnore - arguments isn't optional in the type definition
        delete node.arguments;
        // $FlowIgnore - callee isn't optional in the type definition
        delete node.callee;
      }

      return node;
    }

    toReferencedArguments(
      node:
        | N.CallExpression
        | N.OptionalCallExpression
        | N.EstreeImportExpression,
      /* isParenthesizedExpr?: boolean, */
    ) {
      // ImportExpressions do not have an arguments array.
      if (node.type === "ImportExpression") {
        return;
      }

      super.toReferencedArguments(node);
    }

    parseExport(node: N.Node) {
      super.parseExport(node);

      switch (node.type) {
        case "ExportAllDeclaration":
          node.exported = null;
          break;

        case "ExportNamedDeclaration":
          if (
            node.specifiers.length === 1 &&
            node.specifiers[0].type === "ExportNamespaceSpecifier"
          ) {
            node.type = "ExportAllDeclaration";
            node.exported = node.specifiers[0].exported;
            delete node.specifiers;
          }

          break;
      }

      return node;
    }

    parseSubscript(
      base: N.Expression,
      startPos: number,
      startLoc: Position,
      noCalls: ?boolean,
      state: N.ParseSubscriptState,
    ) {
      const node = super.parseSubscript(
        base,
        startPos,
        startLoc,
        noCalls,
        state,
      );

      if (state.optionalChainMember) {
        // https://github.com/estree/estree/blob/master/es2020.md#chainexpression
        if (
          node.type === "OptionalMemberExpression" ||
          node.type === "OptionalCallExpression"
        ) {
          node.type = node.type.substring(8); // strip Optional prefix
        }
        if (state.stop) {
          const chain = this.startNodeAtNode(node);
          chain.expression = node;
          return this.finishNode(chain, "ChainExpression");
        }
      } else if (
        node.type === "MemberExpression" ||
        node.type === "CallExpression"
      ) {
        node.optional = false;
      }

      return node;
    }

    hasPropertyAsPrivateName(node: N.Node): boolean {
      if (node.type === "ChainExpression") {
        node = node.expression;
      }
      return super.hasPropertyAsPrivateName(node);
    }

    isOptionalChain(node) {
      return node.type === "ChainExpression";
    }
  };
