// @flow

import { types as tt, TokenType } from "../tokenizer/types";
import type Parser from "../parser";
import type { ExpressionErrors } from "../parser/util";
import * as N from "../types";
import type { Position } from "../util/location";
import { type BindingTypes, BIND_NONE } from "../util/scopeflags";
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
      // $FlowIgnore
      const bigInt = typeof BigInt !== "undefined" ? BigInt(value) : null;
      const node = this.estreeParseLiteral(bigInt);
      node.bigint = String(node.value || value);

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

    checkGetterSetterParams(method: N.ObjectMethod | N.ClassMethod): void {
      const prop = ((method: any): N.EstreeProperty | N.EstreeMethodDefinition);
      const paramCount = prop.kind === "get" ? 0 : 1;
      const start = prop.start;
      if (prop.value.params.length !== paramCount) {
        if (method.kind === "get") {
          this.raise(start, Errors.BadGetterArity);
        } else {
          this.raise(start, Errors.BadSetterArity);
        }
      } else if (
        prop.kind === "set" &&
        prop.value.params[0].type === "RestElement"
      ) {
        this.raise(start, Errors.BadSetterRestParameter);
      }
    }

    checkLVal(
      expr: N.Expression,
      bindingType: BindingTypes = BIND_NONE,
      checkClashes: ?{ [key: string]: boolean },
      contextDescription: string,
      disallowLetBinding?: boolean,
    ): void {
      switch (expr.type) {
        case "ObjectPattern":
          expr.properties.forEach(prop => {
            this.checkLVal(
              prop.type === "Property" ? prop.value : prop,
              bindingType,
              checkClashes,
              "object destructuring pattern",
              disallowLetBinding,
            );
          });
          break;
        default:
          super.checkLVal(
            expr,
            bindingType,
            checkClashes,
            contextDescription,
            disallowLetBinding,
          );
      }
    }

    checkDuplicatedProto(
      prop: N.ObjectMember | N.SpreadElement,
      protoRef: { used: boolean },
      refExpressionErrors: ?ExpressionErrors,
    ): void {
      if (
        prop.type === "SpreadElement" ||
        prop.computed ||
        prop.method ||
        // $FlowIgnore
        prop.shorthand
      ) {
        return;
      }

      const key = prop.key;
      // It is either an Identifier or a String/NumericLiteral
      const name = key.type === "Identifier" ? key.name : String(key.value);

      if (name === "__proto__" && prop.kind === "init") {
        // Store the first redefinition's position
        if (protoRef.used) {
          if (refExpressionErrors?.doubleProto === -1) {
            refExpressionErrors.doubleProto = key.start;
          } else {
            this.raise(key.start, Errors.DuplicateProto);
          }
        }

        protoRef.used = true;
      }
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
      allowDirectives: ?boolean,
      topLevel: boolean,
      end: TokenType,
    ): void {
      super.parseBlockBody(node, allowDirectives, topLevel, end);

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
      containsEsc: boolean,
    ): ?N.ObjectMethod {
      const node: N.EstreeProperty = (super.parseObjectMethod(
        prop,
        isGenerator,
        isAsync,
        isPattern,
        containsEsc,
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

    toAssignable(node: N.Node): N.Node {
      if (isSimpleProperty(node)) {
        this.toAssignable(node.value);

        return node;
      }

      return super.toAssignable(node);
    }

    toAssignableObjectExpressionProp(prop: N.Node, isLast: boolean) {
      if (prop.kind === "get" || prop.kind === "set") {
        throw this.raise(prop.key.start, Errors.PatternHasAccessor);
      } else if (prop.method) {
        throw this.raise(prop.key.start, Errors.PatternHasMethod);
      } else {
        super.toAssignableObjectExpressionProp(prop, isLast);
      }
    }

    finishCallExpression<
      T: N.CallExpression | N.OptionalCallExpression | N.EventualCallExpression,
    >(node: T, optional: boolean, eventual: boolean): N.Expression {
      super.finishCallExpression(node, optional, eventual);

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

    toReferencedListDeep(
      exprList: $ReadOnlyArray<?N.Expression>,
      isParenthesizedExpr?: boolean,
    ): void {
      // ImportExpressions do not have an arguments array.
      if (!exprList) {
        return;
      }

      super.toReferencedListDeep(exprList, isParenthesizedExpr);
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
  };
