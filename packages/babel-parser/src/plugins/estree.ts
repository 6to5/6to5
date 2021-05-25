import { TokenType } from "../tokenizer/types";
import type Parser from "../parser";
import type { ExpressionErrors } from "../parser/util";
import * as N from "../types";
import type { Position } from "../util/location";
import { Errors } from "../parser/error";

export default (superClass: typeof Parser) =>
  class ESTreeParserMixin extends superClass implements Parser {
    parseRegExpLiteral({ pattern, flags }): any {
      let regex = null;
      try {
        regex = new RegExp(pattern, flags);
      } catch (e) {
        // In environments that don't support these flags value will
        // be null as the regex can't be represented natively.
      }
      const node = this.estreeParseLiteral<N.EstreeRegExpLiteral>(regex);
      node.regex = { pattern, flags };

      return node;
    }

    parseBigIntLiteral(value: any): any {
      // https://github.com/estree/estree/blob/master/es2020.md#bigintliteral
      let bigInt;
      try {
        // @ts-ignore todo($FlowIgnore)
        bigInt = BigInt(value);
      } catch {
        bigInt = null;
      }
      const node = this.estreeParseLiteral<N.EstreeBigIntLiteral>(bigInt);
      node.bigint = String(node.value || value);

      return node;
    }

    parseDecimalLiteral(value: any): any {
      // https://github.com/estree/estree/blob/master/experimental/decimal.md
      // todo: use BigDecimal when node supports it.
      const decimal = null;
      const node = this.estreeParseLiteral(decimal);
      node.decimal = String(node.value || value);

      return node;
    }

    estreeParseLiteral<T extends N.Node>(value: any) {
      return this.parseLiteral<T>(value, "Literal");
    }

    parseStringLiteral(value: any): any {
      return this.estreeParseLiteral(value);
    }

    parseNumericLiteral(value: any): any {
      return this.estreeParseLiteral(value);
    }

    parseNullLiteral(): any {
      return this.estreeParseLiteral(null);
    }

    parseBooleanLiteral(value: boolean): N.BooleanLiteral {
      return this.estreeParseLiteral(value);
    }

    directiveToStmt(directive: N.Directive): N.ExpressionStatement {
      const directiveLiteral = directive.value;

      const stmt = this.startNodeAt(directive.start, directive.loc.start);
      const expression = this.startNodeAt(
        directiveLiteral.start,
        directiveLiteral.loc.start,
      );

      expression.value = directiveLiteral.extra.expressionValue;
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
      ) as N.ExpressionStatement;
    }

    // ==================================
    // Overrides
    // ==================================

    initFunction(
      node: N.BodilessFunctionOrMethodBase,
      isAsync?: boolean | null,
    ): void {
      super.initFunction(node, isAsync);
      node.expression = false;
    }

    checkDeclaration(node: N.Pattern | N.ObjectProperty): void {
      if (node != null && this.isObjectProperty(node)) {
        // @ts-expect-error todo(flow->ts) node types
        this.checkDeclaration((node as any as N.EstreeProperty).value);
      } else {
        super.checkDeclaration(node);
      }
    }

    getObjectOrClassMethodParams(method: N.ObjectMethod | N.ClassMethod) {
      return (method as any as N.EstreeProperty | N.EstreeMethodDefinition)
        .value.params;
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

      // Record the expression value as in estree mode we want
      // the stmt to have the real value e.g. ("use strict") and
      // not the raw value e.g. ("use\\x20strict")
      this.addExtra(directive.value, "expressionValue", value);

      return directive;
    }

    parseBlockBody(
      node: N.BlockStatementLike,
      allowDirectives: boolean | undefined | null,
      topLevel: boolean,
      end: TokenType,
      afterBlockParse?: (hasStrictModeDirective: boolean) => void,
    ): void {
      super.parseBlockBody(
        node,
        allowDirectives,
        topLevel,
        end,
        afterBlockParse,
      );

      const directiveStatements = node.directives.map(d =>
        this.directiveToStmt(d),
      );
      node.body = [...directiveStatements, ...node.body];
      // @ts-ignore todo($FlowIgnore) - directives isn't optional in the type definition
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
        // @ts-ignore todo($FlowIgnore)
        method.value.typeParameters = method.typeParameters;
        delete method.typeParameters;
      }
      classBody.body.push(method);
    }

    parseMaybePrivateName(isPrivateNameAllowed: boolean): any {
      const node = super.parseMaybePrivateName(isPrivateNameAllowed);
      if (
        node.type === "PrivateName" &&
        this.getPluginOption("estree", "classFeatures")
      ) {
        return this.convertPrivateNameToPrivateIdentifier(node);
      }
      return node;
    }

    convertPrivateNameToPrivateIdentifier(
      node: N.PrivateName,
    ): N.EstreePrivateIdentifier {
      const name = super.getPrivateNameSV(node);
      node = node as any;
      delete node.id;
      node.name = name;
      node.type = "PrivateIdentifier";
      return node;
    }

    isPrivateName(node: N.Node): boolean {
      if (!this.getPluginOption("estree", "classFeatures")) {
        return super.isPrivateName(node);
      }
      return node.type === "PrivateIdentifier";
    }

    getPrivateNameSV(node: N.Node): string {
      if (!this.getPluginOption("estree", "classFeatures")) {
        return super.getPrivateNameSV(node);
      }
      return node.name;
    }

    parseLiteral<T extends N.Node>(value: any, type: T["type"]): T {
      const node = super.parseLiteral<T>(value, type);
      node.raw = node.extra.raw;
      delete node.extra;

      return node;
    }

    parseFunctionBody(
      node: N.Function,
      allowExpression?: boolean | null,
      isMethod: boolean = false,
    ): void {
      super.parseFunctionBody(node, allowExpression, isMethod);
      node.expression = node.body.type !== "BlockStatement";
    }

    parseMethod<T extends N.MethodLike>(
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
      // @ts-ignore todo($FlowIgnore)
      node.value = funcNode;
      if (type === "ClassPrivateMethod") {
        // @ts-ignore todo($FlowIgnore)
        node.computed = false;
      }
      type = "MethodDefinition";
      return this.finishNode(node, type);
    }

    parseClassProperty(node: N.ClassProperty): any {
      const propertyNode = super.parseClassProperty(node) as any;
      if (this.getPluginOption("estree", "classFeatures")) {
        propertyNode.type = "PropertyDefinition";
      }
      return propertyNode as N.EstreePropertyDefinition;
    }

    parseClassPrivateProperty(node: N.ClassPrivateProperty): any {
      const propertyNode = super.parseClassPrivateProperty(node) as any;
      if (this.getPluginOption("estree", "classFeatures")) {
        propertyNode.type = "PropertyDefinition";
        propertyNode.computed = false;
      }
      return propertyNode as N.EstreePropertyDefinition;
    }

    parseObjectMethod(
      prop: N.ObjectMethod,
      isGenerator: boolean,
      isAsync: boolean,
      isPattern: boolean,
      isAccessor: boolean,
    ): N.ObjectMethod | undefined | null {
      const node: N.EstreeProperty = super.parseObjectMethod(
        prop,
        isGenerator,
        isAsync,
        isPattern,
        isAccessor,
      ) as any;

      if (node) {
        node.type = "Property";
        if ((node as any as N.ClassMethod).kind === "method") {
          node.kind = "init";
        }
        node.shorthand = false;
      }

      return node as any;
    }

    parseObjectProperty(
      prop: N.ObjectProperty,
      startPos: number | undefined | null,
      startLoc: Position | undefined | null,
      isPattern: boolean,
      refExpressionErrors?: ExpressionErrors | null,
    ): N.ObjectProperty | undefined | null {
      const node: N.EstreeProperty = super.parseObjectProperty(
        prop,
        startPos,
        startLoc,
        isPattern,
        refExpressionErrors,
      ) as any;

      if (node) {
        node.kind = "init";
        node.type = "Property";
      }

      return node as any;
    }

    toAssignable(node: N.Node, isLHS: boolean = false): N.Node {
      if (node != null && this.isObjectProperty(node)) {
        this.toAssignable(node.value, isLHS);

        return node;
      }

      return super.toAssignable(node, isLHS);
    }

    toAssignableObjectExpressionProp(
      prop: N.Node,
      isLast: boolean,
      isLHS: boolean,
    ) {
      if (prop.kind === "get" || prop.kind === "set") {
        this.raise(prop.key.start, Errors.PatternHasAccessor);
      } else if (prop.method) {
        this.raise(prop.key.start, Errors.PatternHasMethod);
      } else {
        super.toAssignableObjectExpressionProp(prop, isLast, isLHS);
      }
    }

    finishCallExpression<T extends N.CallExpression | N.OptionalCallExpression>(
      node: T,
      optional: boolean,
    ): N.Expression {
      super.finishCallExpression(node, optional);

      if (node.callee.type === "Import") {
        (node as N.Node as N.EstreeImportExpression).type = "ImportExpression";
        (node as N.Node as N.EstreeImportExpression).source = node.arguments[0];
        if (this.hasPlugin("importAssertions")) {
          (node as N.Node as N.EstreeImportExpression).attributes =
            node.arguments[1] ?? null;
        }
        // @ts-ignore todo($FlowIgnore) - arguments isn't optional in the type definition
        delete node.arguments;
        // @ts-ignore todo($FlowIgnore) - callee isn't optional in the type definition
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

    parseExport(node: N.Node): N.AnyExport {
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

      return node as N.AnyExport;
    }

    parseSubscript(
      base: N.Expression,
      startPos: number,
      startLoc: Position,
      noCalls: boolean | undefined | null,
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

    isOptionalChain(node: N.Node): boolean {
      return node.type === "ChainExpression";
    }

    isObjectProperty(node: N.Node): boolean {
      return node.type === "Property" && node.kind === "init" && !node.method;
    }

    isObjectMethod(node: N.Node): boolean {
      return node.method || node.kind === "get" || node.kind === "set";
    }
  };
