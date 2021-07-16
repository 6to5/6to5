/*
 * This file is auto-generated! Do not modify it directly.
 * To re-generate run 'make build'
 */
import * as t from "@babel/types";
import NodePath from "../index";

export interface NodePathValidators {
  isAnyTypeAnnotation(opts?: object): this is NodePath<t.AnyTypeAnnotation>;
  isArgumentPlaceholder(opts?: object): this is NodePath<t.ArgumentPlaceholder>;
  isArrayExpression(opts?: object): this is NodePath<t.ArrayExpression>;
  isArrayPattern(opts?: object): this is NodePath<t.ArrayPattern>;
  isArrayTypeAnnotation(opts?: object): this is NodePath<t.ArrayTypeAnnotation>;
  isArrowFunctionExpression(
    opts?: object,
  ): this is NodePath<t.ArrowFunctionExpression>;
  isAssignmentExpression(
    opts?: object,
  ): this is NodePath<t.AssignmentExpression>;
  isAssignmentPattern(opts?: object): this is NodePath<t.AssignmentPattern>;
  isAwaitExpression(opts?: object): this is NodePath<t.AwaitExpression>;
  isBigIntLiteral(opts?: object): this is NodePath<t.BigIntLiteral>;
  isBinary(opts?: object): this is NodePath<t.Binary>;
  isBinaryExpression(opts?: object): this is NodePath<t.BinaryExpression>;
  isBindExpression(opts?: object): this is NodePath<t.BindExpression>;
  isBlock(opts?: object): this is NodePath<t.Block>;
  isBlockParent(opts?: object): this is NodePath<t.BlockParent>;
  isBlockStatement(opts?: object): this is NodePath<t.BlockStatement>;
  isBooleanLiteral(opts?: object): this is NodePath<t.BooleanLiteral>;
  isBooleanLiteralTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.BooleanLiteralTypeAnnotation>;
  isBooleanTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.BooleanTypeAnnotation>;
  isBreakStatement(opts?: object): this is NodePath<t.BreakStatement>;
  isCallExpression(opts?: object): this is NodePath<t.CallExpression>;
  isCatchClause(opts?: object): this is NodePath<t.CatchClause>;
  isClass(opts?: object): this is NodePath<t.Class>;
  isClassBody(opts?: object): this is NodePath<t.ClassBody>;
  isClassDeclaration(opts?: object): this is NodePath<t.ClassDeclaration>;
  isClassExpression(opts?: object): this is NodePath<t.ClassExpression>;
  isClassImplements(opts?: object): this is NodePath<t.ClassImplements>;
  isClassMethod(opts?: object): this is NodePath<t.ClassMethod>;
  isClassPrivateMethod(opts?: object): this is NodePath<t.ClassPrivateMethod>;
  isClassPrivateProperty(
    opts?: object,
  ): this is NodePath<t.ClassPrivateProperty>;
  isClassProperty(opts?: object): this is NodePath<t.ClassProperty>;
  isCompletionStatement(opts?: object): this is NodePath<t.CompletionStatement>;
  isConditional(opts?: object): this is NodePath<t.Conditional>;
  isConditionalExpression(
    opts?: object,
  ): this is NodePath<t.ConditionalExpression>;
  isContinueStatement(opts?: object): this is NodePath<t.ContinueStatement>;
  isDebuggerStatement(opts?: object): this is NodePath<t.DebuggerStatement>;
  isDecimalLiteral(opts?: object): this is NodePath<t.DecimalLiteral>;
  isDeclaration(opts?: object): this is NodePath<t.Declaration>;
  isDeclareClass(opts?: object): this is NodePath<t.DeclareClass>;
  isDeclareExportAllDeclaration(
    opts?: object,
  ): this is NodePath<t.DeclareExportAllDeclaration>;
  isDeclareExportDeclaration(
    opts?: object,
  ): this is NodePath<t.DeclareExportDeclaration>;
  isDeclareFunction(opts?: object): this is NodePath<t.DeclareFunction>;
  isDeclareInterface(opts?: object): this is NodePath<t.DeclareInterface>;
  isDeclareModule(opts?: object): this is NodePath<t.DeclareModule>;
  isDeclareModuleExports(
    opts?: object,
  ): this is NodePath<t.DeclareModuleExports>;
  isDeclareOpaqueType(opts?: object): this is NodePath<t.DeclareOpaqueType>;
  isDeclareTypeAlias(opts?: object): this is NodePath<t.DeclareTypeAlias>;
  isDeclareVariable(opts?: object): this is NodePath<t.DeclareVariable>;
  isDeclaredPredicate(opts?: object): this is NodePath<t.DeclaredPredicate>;
  isDecorator(opts?: object): this is NodePath<t.Decorator>;
  isDirective(opts?: object): this is NodePath<t.Directive>;
  isDirectiveLiteral(opts?: object): this is NodePath<t.DirectiveLiteral>;
  isDoExpression(opts?: object): this is NodePath<t.DoExpression>;
  isDoWhileStatement(opts?: object): this is NodePath<t.DoWhileStatement>;
  isEmptyStatement(opts?: object): this is NodePath<t.EmptyStatement>;
  isEmptyTypeAnnotation(opts?: object): this is NodePath<t.EmptyTypeAnnotation>;
  isEnumBody(opts?: object): this is NodePath<t.EnumBody>;
  isEnumBooleanBody(opts?: object): this is NodePath<t.EnumBooleanBody>;
  isEnumBooleanMember(opts?: object): this is NodePath<t.EnumBooleanMember>;
  isEnumDeclaration(opts?: object): this is NodePath<t.EnumDeclaration>;
  isEnumDefaultedMember(opts?: object): this is NodePath<t.EnumDefaultedMember>;
  isEnumMember(opts?: object): this is NodePath<t.EnumMember>;
  isEnumNumberBody(opts?: object): this is NodePath<t.EnumNumberBody>;
  isEnumNumberMember(opts?: object): this is NodePath<t.EnumNumberMember>;
  isEnumStringBody(opts?: object): this is NodePath<t.EnumStringBody>;
  isEnumStringMember(opts?: object): this is NodePath<t.EnumStringMember>;
  isEnumSymbolBody(opts?: object): this is NodePath<t.EnumSymbolBody>;
  isExistsTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.ExistsTypeAnnotation>;
  isExportAllDeclaration(
    opts?: object,
  ): this is NodePath<t.ExportAllDeclaration>;
  isExportDeclaration(opts?: object): this is NodePath<t.ExportDeclaration>;
  isExportDefaultDeclaration(
    opts?: object,
  ): this is NodePath<t.ExportDefaultDeclaration>;
  isExportDefaultSpecifier(
    opts?: object,
  ): this is NodePath<t.ExportDefaultSpecifier>;
  isExportNamedDeclaration(
    opts?: object,
  ): this is NodePath<t.ExportNamedDeclaration>;
  isExportNamespaceSpecifier(
    opts?: object,
  ): this is NodePath<t.ExportNamespaceSpecifier>;
  isExportSpecifier(opts?: object): this is NodePath<t.ExportSpecifier>;
  isExpression(opts?: object): this is NodePath<t.Expression>;
  isExpressionStatement(opts?: object): this is NodePath<t.ExpressionStatement>;
  isExpressionWrapper(opts?: object): this is NodePath<t.ExpressionWrapper>;
  isFile(opts?: object): this is NodePath<t.File>;
  isFlow(opts?: object): this is NodePath<t.Flow>;
  isFlowBaseAnnotation(opts?: object): this is NodePath<t.FlowBaseAnnotation>;
  isFlowDeclaration(opts?: object): this is NodePath<t.FlowDeclaration>;
  isFlowPredicate(opts?: object): this is NodePath<t.FlowPredicate>;
  isFlowType(opts?: object): this is NodePath<t.FlowType>;
  isFor(opts?: object): this is NodePath<t.For>;
  isForInStatement(opts?: object): this is NodePath<t.ForInStatement>;
  isForOfStatement(opts?: object): this is NodePath<t.ForOfStatement>;
  isForStatement(opts?: object): this is NodePath<t.ForStatement>;
  isForXStatement(opts?: object): this is NodePath<t.ForXStatement>;
  isFunction(opts?: object): this is NodePath<t.Function>;
  isFunctionDeclaration(opts?: object): this is NodePath<t.FunctionDeclaration>;
  isFunctionExpression(opts?: object): this is NodePath<t.FunctionExpression>;
  isFunctionParent(opts?: object): this is NodePath<t.FunctionParent>;
  isFunctionTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.FunctionTypeAnnotation>;
  isFunctionTypeParam(opts?: object): this is NodePath<t.FunctionTypeParam>;
  isGenericTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.GenericTypeAnnotation>;
  isIdentifier(opts?: object): this is NodePath<t.Identifier>;
  isIfStatement(opts?: object): this is NodePath<t.IfStatement>;
  isImmutable(opts?: object): this is NodePath<t.Immutable>;
  isImport(opts?: object): this is NodePath<t.Import>;
  isImportAttribute(opts?: object): this is NodePath<t.ImportAttribute>;
  isImportDeclaration(opts?: object): this is NodePath<t.ImportDeclaration>;
  isImportDefaultSpecifier(
    opts?: object,
  ): this is NodePath<t.ImportDefaultSpecifier>;
  isImportNamespaceSpecifier(
    opts?: object,
  ): this is NodePath<t.ImportNamespaceSpecifier>;
  isImportSpecifier(opts?: object): this is NodePath<t.ImportSpecifier>;
  isIndexedAccessType(opts?: object): this is NodePath<t.IndexedAccessType>;
  isInferredPredicate(opts?: object): this is NodePath<t.InferredPredicate>;
  isInterfaceDeclaration(
    opts?: object,
  ): this is NodePath<t.InterfaceDeclaration>;
  isInterfaceExtends(opts?: object): this is NodePath<t.InterfaceExtends>;
  isInterfaceTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.InterfaceTypeAnnotation>;
  isInterpreterDirective(
    opts?: object,
  ): this is NodePath<t.InterpreterDirective>;
  isIntersectionTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.IntersectionTypeAnnotation>;
  isJSX(opts?: object): this is NodePath<t.JSX>;
  isJSXAttribute(opts?: object): this is NodePath<t.JSXAttribute>;
  isJSXClosingElement(opts?: object): this is NodePath<t.JSXClosingElement>;
  isJSXClosingFragment(opts?: object): this is NodePath<t.JSXClosingFragment>;
  isJSXElement(opts?: object): this is NodePath<t.JSXElement>;
  isJSXEmptyExpression(opts?: object): this is NodePath<t.JSXEmptyExpression>;
  isJSXExpressionContainer(
    opts?: object,
  ): this is NodePath<t.JSXExpressionContainer>;
  isJSXFragment(opts?: object): this is NodePath<t.JSXFragment>;
  isJSXIdentifier(opts?: object): this is NodePath<t.JSXIdentifier>;
  isJSXMemberExpression(opts?: object): this is NodePath<t.JSXMemberExpression>;
  isJSXNamespacedName(opts?: object): this is NodePath<t.JSXNamespacedName>;
  isJSXOpeningElement(opts?: object): this is NodePath<t.JSXOpeningElement>;
  isJSXOpeningFragment(opts?: object): this is NodePath<t.JSXOpeningFragment>;
  isJSXSpreadAttribute(opts?: object): this is NodePath<t.JSXSpreadAttribute>;
  isJSXSpreadChild(opts?: object): this is NodePath<t.JSXSpreadChild>;
  isJSXText(opts?: object): this is NodePath<t.JSXText>;
  isLVal(opts?: object): this is NodePath<t.LVal>;
  isLabeledStatement(opts?: object): this is NodePath<t.LabeledStatement>;
  isLiteral(opts?: object): this is NodePath<t.Literal>;
  isLogicalExpression(opts?: object): this is NodePath<t.LogicalExpression>;
  isLoop(opts?: object): this is NodePath<t.Loop>;
  isMemberExpression(opts?: object): this is NodePath<t.MemberExpression>;
  isMetaProperty(opts?: object): this is NodePath<t.MetaProperty>;
  isMethod(opts?: object): this is NodePath<t.Method>;
  isMixedTypeAnnotation(opts?: object): this is NodePath<t.MixedTypeAnnotation>;
  isModuleDeclaration(opts?: object): this is NodePath<t.ModuleDeclaration>;
  isModuleExpression(opts?: object): this is NodePath<t.ModuleExpression>;
  isModuleSpecifier(opts?: object): this is NodePath<t.ModuleSpecifier>;
  isNewExpression(opts?: object): this is NodePath<t.NewExpression>;
  isNoop(opts?: object): this is NodePath<t.Noop>;
  isNullLiteral(opts?: object): this is NodePath<t.NullLiteral>;
  isNullLiteralTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.NullLiteralTypeAnnotation>;
  isNullableTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.NullableTypeAnnotation>;
  isNumberLiteral(opts?: object): this is NodePath<t.NumberLiteral>;
  isNumberLiteralTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.NumberLiteralTypeAnnotation>;
  isNumberTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.NumberTypeAnnotation>;
  isNumericLiteral(opts?: object): this is NodePath<t.NumericLiteral>;
  isObjectExpression(opts?: object): this is NodePath<t.ObjectExpression>;
  isObjectMember(opts?: object): this is NodePath<t.ObjectMember>;
  isObjectMethod(opts?: object): this is NodePath<t.ObjectMethod>;
  isObjectPattern(opts?: object): this is NodePath<t.ObjectPattern>;
  isObjectProperty(opts?: object): this is NodePath<t.ObjectProperty>;
  isObjectTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.ObjectTypeAnnotation>;
  isObjectTypeCallProperty(
    opts?: object,
  ): this is NodePath<t.ObjectTypeCallProperty>;
  isObjectTypeIndexer(opts?: object): this is NodePath<t.ObjectTypeIndexer>;
  isObjectTypeInternalSlot(
    opts?: object,
  ): this is NodePath<t.ObjectTypeInternalSlot>;
  isObjectTypeProperty(opts?: object): this is NodePath<t.ObjectTypeProperty>;
  isObjectTypeSpreadProperty(
    opts?: object,
  ): this is NodePath<t.ObjectTypeSpreadProperty>;
  isOpaqueType(opts?: object): this is NodePath<t.OpaqueType>;
  isOptionalCallExpression(
    opts?: object,
  ): this is NodePath<t.OptionalCallExpression>;
  isOptionalIndexedAccessType(
    opts?: object,
  ): this is NodePath<t.OptionalIndexedAccessType>;
  isOptionalMemberExpression(
    opts?: object,
  ): this is NodePath<t.OptionalMemberExpression>;
  isParenthesizedExpression(
    opts?: object,
  ): this is NodePath<t.ParenthesizedExpression>;
  isPattern(opts?: object): this is NodePath<t.Pattern>;
  isPatternLike(opts?: object): this is NodePath<t.PatternLike>;
  isPipelineBareFunction(
    opts?: object,
  ): this is NodePath<t.PipelineBareFunction>;
  isPipelinePrimaryTopicReference(
    opts?: object,
  ): this is NodePath<t.PipelinePrimaryTopicReference>;
  isPipelineTopicExpression(
    opts?: object,
  ): this is NodePath<t.PipelineTopicExpression>;
  isPlaceholder(opts?: object): this is NodePath<t.Placeholder>;
  isPrivate(opts?: object): this is NodePath<t.Private>;
  isPrivateName(opts?: object): this is NodePath<t.PrivateName>;
  isProgram(opts?: object): this is NodePath<t.Program>;
  isProperty(opts?: object): this is NodePath<t.Property>;
  isPureish(opts?: object): this is NodePath<t.Pureish>;
  isQualifiedTypeIdentifier(
    opts?: object,
  ): this is NodePath<t.QualifiedTypeIdentifier>;
  isRecordExpression(opts?: object): this is NodePath<t.RecordExpression>;
  isRegExpLiteral(opts?: object): this is NodePath<t.RegExpLiteral>;
  isRegexLiteral(opts?: object): this is NodePath<t.RegexLiteral>;
  isRestElement(opts?: object): this is NodePath<t.RestElement>;
  isRestProperty(opts?: object): this is NodePath<t.RestProperty>;
  isReturnStatement(opts?: object): this is NodePath<t.ReturnStatement>;
  isScopable(opts?: object): this is NodePath<t.Scopable>;
  isSequenceExpression(opts?: object): this is NodePath<t.SequenceExpression>;
  isSpreadElement(opts?: object): this is NodePath<t.SpreadElement>;
  isSpreadProperty(opts?: object): this is NodePath<t.SpreadProperty>;
  isStatement(opts?: object): this is NodePath<t.Statement>;
  isStaticBlock(opts?: object): this is NodePath<t.StaticBlock>;
  isStringLiteral(opts?: object): this is NodePath<t.StringLiteral>;
  isStringLiteralTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.StringLiteralTypeAnnotation>;
  isStringTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.StringTypeAnnotation>;
  isSuper(opts?: object): this is NodePath<t.Super>;
  isSwitchCase(opts?: object): this is NodePath<t.SwitchCase>;
  isSwitchStatement(opts?: object): this is NodePath<t.SwitchStatement>;
  isSymbolTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.SymbolTypeAnnotation>;
  isTSAnyKeyword(opts?: object): this is NodePath<t.TSAnyKeyword>;
  isTSArrayType(opts?: object): this is NodePath<t.TSArrayType>;
  isTSAsExpression(opts?: object): this is NodePath<t.TSAsExpression>;
  isTSBaseType(opts?: object): this is NodePath<t.TSBaseType>;
  isTSBigIntKeyword(opts?: object): this is NodePath<t.TSBigIntKeyword>;
  isTSBooleanKeyword(opts?: object): this is NodePath<t.TSBooleanKeyword>;
  isTSCallSignatureDeclaration(
    opts?: object,
  ): this is NodePath<t.TSCallSignatureDeclaration>;
  isTSConditionalType(opts?: object): this is NodePath<t.TSConditionalType>;
  isTSConstructSignatureDeclaration(
    opts?: object,
  ): this is NodePath<t.TSConstructSignatureDeclaration>;
  isTSConstructorType(opts?: object): this is NodePath<t.TSConstructorType>;
  isTSDeclareFunction(opts?: object): this is NodePath<t.TSDeclareFunction>;
  isTSDeclareMethod(opts?: object): this is NodePath<t.TSDeclareMethod>;
  isTSEntityName(opts?: object): this is NodePath<t.TSEntityName>;
  isTSEnumDeclaration(opts?: object): this is NodePath<t.TSEnumDeclaration>;
  isTSEnumMember(opts?: object): this is NodePath<t.TSEnumMember>;
  isTSExportAssignment(opts?: object): this is NodePath<t.TSExportAssignment>;
  isTSExpressionWithTypeArguments(
    opts?: object,
  ): this is NodePath<t.TSExpressionWithTypeArguments>;
  isTSExternalModuleReference(
    opts?: object,
  ): this is NodePath<t.TSExternalModuleReference>;
  isTSFunctionType(opts?: object): this is NodePath<t.TSFunctionType>;
  isTSImportEqualsDeclaration(
    opts?: object,
  ): this is NodePath<t.TSImportEqualsDeclaration>;
  isTSImportType(opts?: object): this is NodePath<t.TSImportType>;
  isTSIndexSignature(opts?: object): this is NodePath<t.TSIndexSignature>;
  isTSIndexedAccessType(opts?: object): this is NodePath<t.TSIndexedAccessType>;
  isTSInferType(opts?: object): this is NodePath<t.TSInferType>;
  isTSInterfaceBody(opts?: object): this is NodePath<t.TSInterfaceBody>;
  isTSInterfaceDeclaration(
    opts?: object,
  ): this is NodePath<t.TSInterfaceDeclaration>;
  isTSIntersectionType(opts?: object): this is NodePath<t.TSIntersectionType>;
  isTSIntrinsicKeyword(opts?: object): this is NodePath<t.TSIntrinsicKeyword>;
  isTSLiteralType(opts?: object): this is NodePath<t.TSLiteralType>;
  isTSMappedType(opts?: object): this is NodePath<t.TSMappedType>;
  isTSMethodSignature(opts?: object): this is NodePath<t.TSMethodSignature>;
  isTSModuleBlock(opts?: object): this is NodePath<t.TSModuleBlock>;
  isTSModuleDeclaration(opts?: object): this is NodePath<t.TSModuleDeclaration>;
  isTSNamedTupleMember(opts?: object): this is NodePath<t.TSNamedTupleMember>;
  isTSNamespaceExportDeclaration(
    opts?: object,
  ): this is NodePath<t.TSNamespaceExportDeclaration>;
  isTSNeverKeyword(opts?: object): this is NodePath<t.TSNeverKeyword>;
  isTSNonNullExpression(opts?: object): this is NodePath<t.TSNonNullExpression>;
  isTSNullKeyword(opts?: object): this is NodePath<t.TSNullKeyword>;
  isTSNumberKeyword(opts?: object): this is NodePath<t.TSNumberKeyword>;
  isTSObjectKeyword(opts?: object): this is NodePath<t.TSObjectKeyword>;
  isTSOptionalType(opts?: object): this is NodePath<t.TSOptionalType>;
  isTSParameterProperty(opts?: object): this is NodePath<t.TSParameterProperty>;
  isTSParenthesizedType(opts?: object): this is NodePath<t.TSParenthesizedType>;
  isTSPropertySignature(opts?: object): this is NodePath<t.TSPropertySignature>;
  isTSQualifiedName(opts?: object): this is NodePath<t.TSQualifiedName>;
  isTSRestType(opts?: object): this is NodePath<t.TSRestType>;
  isTSStringKeyword(opts?: object): this is NodePath<t.TSStringKeyword>;
  isTSSymbolKeyword(opts?: object): this is NodePath<t.TSSymbolKeyword>;
  isTSThisType(opts?: object): this is NodePath<t.TSThisType>;
  isTSTupleType(opts?: object): this is NodePath<t.TSTupleType>;
  isTSType(opts?: object): this is NodePath<t.TSType>;
  isTSTypeAliasDeclaration(
    opts?: object,
  ): this is NodePath<t.TSTypeAliasDeclaration>;
  isTSTypeAnnotation(opts?: object): this is NodePath<t.TSTypeAnnotation>;
  isTSTypeAssertion(opts?: object): this is NodePath<t.TSTypeAssertion>;
  isTSTypeElement(opts?: object): this is NodePath<t.TSTypeElement>;
  isTSTypeLiteral(opts?: object): this is NodePath<t.TSTypeLiteral>;
  isTSTypeOperator(opts?: object): this is NodePath<t.TSTypeOperator>;
  isTSTypeParameter(opts?: object): this is NodePath<t.TSTypeParameter>;
  isTSTypeParameterDeclaration(
    opts?: object,
  ): this is NodePath<t.TSTypeParameterDeclaration>;
  isTSTypeParameterInstantiation(
    opts?: object,
  ): this is NodePath<t.TSTypeParameterInstantiation>;
  isTSTypePredicate(opts?: object): this is NodePath<t.TSTypePredicate>;
  isTSTypeQuery(opts?: object): this is NodePath<t.TSTypeQuery>;
  isTSTypeReference(opts?: object): this is NodePath<t.TSTypeReference>;
  isTSUndefinedKeyword(opts?: object): this is NodePath<t.TSUndefinedKeyword>;
  isTSUnionType(opts?: object): this is NodePath<t.TSUnionType>;
  isTSUnknownKeyword(opts?: object): this is NodePath<t.TSUnknownKeyword>;
  isTSVoidKeyword(opts?: object): this is NodePath<t.TSVoidKeyword>;
  isTaggedTemplateExpression(
    opts?: object,
  ): this is NodePath<t.TaggedTemplateExpression>;
  isTemplateElement(opts?: object): this is NodePath<t.TemplateElement>;
  isTemplateLiteral(opts?: object): this is NodePath<t.TemplateLiteral>;
  isTerminatorless(opts?: object): this is NodePath<t.Terminatorless>;
  isThisExpression(opts?: object): this is NodePath<t.ThisExpression>;
  isThisTypeAnnotation(opts?: object): this is NodePath<t.ThisTypeAnnotation>;
  isThrowStatement(opts?: object): this is NodePath<t.ThrowStatement>;
  isTopicReference(opts?: object): this is NodePath<t.TopicReference>;
  isTryStatement(opts?: object): this is NodePath<t.TryStatement>;
  isTupleExpression(opts?: object): this is NodePath<t.TupleExpression>;
  isTupleTypeAnnotation(opts?: object): this is NodePath<t.TupleTypeAnnotation>;
  isTypeAlias(opts?: object): this is NodePath<t.TypeAlias>;
  isTypeAnnotation(opts?: object): this is NodePath<t.TypeAnnotation>;
  isTypeCastExpression(opts?: object): this is NodePath<t.TypeCastExpression>;
  isTypeParameter(opts?: object): this is NodePath<t.TypeParameter>;
  isTypeParameterDeclaration(
    opts?: object,
  ): this is NodePath<t.TypeParameterDeclaration>;
  isTypeParameterInstantiation(
    opts?: object,
  ): this is NodePath<t.TypeParameterInstantiation>;
  isTypeofTypeAnnotation(
    opts?: object,
  ): this is NodePath<t.TypeofTypeAnnotation>;
  isUnaryExpression(opts?: object): this is NodePath<t.UnaryExpression>;
  isUnaryLike(opts?: object): this is NodePath<t.UnaryLike>;
  isUnionTypeAnnotation(opts?: object): this is NodePath<t.UnionTypeAnnotation>;
  isUpdateExpression(opts?: object): this is NodePath<t.UpdateExpression>;
  isUserWhitespacable(opts?: object): this is NodePath<t.UserWhitespacable>;
  isV8IntrinsicIdentifier(
    opts?: object,
  ): this is NodePath<t.V8IntrinsicIdentifier>;
  isVariableDeclaration(opts?: object): this is NodePath<t.VariableDeclaration>;
  isVariableDeclarator(opts?: object): this is NodePath<t.VariableDeclarator>;
  isVariance(opts?: object): this is NodePath<t.Variance>;
  isVoidTypeAnnotation(opts?: object): this is NodePath<t.VoidTypeAnnotation>;
  isWhile(opts?: object): this is NodePath<t.While>;
  isWhileStatement(opts?: object): this is NodePath<t.WhileStatement>;
  isWithStatement(opts?: object): this is NodePath<t.WithStatement>;
  isYieldExpression(opts?: object): this is NodePath<t.YieldExpression>;
  isReferencedIdentifier(opts?: object): boolean;
  isReferencedMemberExpression(opts?: object): boolean;
  isBindingIdentifier(opts?: object): boolean;
  isStatement(opts?: object): this is NodePath<t.Statement>;
  isExpression(opts?: object): this is NodePath<t.Expression>;
  isScope(opts?: object): boolean;
  isReferenced(opts?: object): boolean;
  isBlockScoped(opts?: object): boolean;
  isVar(opts?: object): boolean;
  isUser(opts?: object): boolean;
  isGenerated(opts?: object): boolean;
  isPure(opts?: object): boolean;
  isFlow(opts?: object): this is NodePath<t.Flow>;
  isRestProperty(opts?: object): boolean;
  isSpreadProperty(opts?: object): boolean;
  isExistentialTypeParam(opts?: object): boolean;
  isNumericLiteralTypeAnnotation(opts?: object): boolean;
  isForAwaitStatement(opts?: object): boolean;
}
