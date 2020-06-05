// @flow
/*
 * This file is auto-generated! Do not modify it directly.
 * To re-generate run 'make build'
 */
import externalHelpers from "@babel/plugin-external-helpers";
import syntaxAsyncGenerators from "@babel/plugin-syntax-async-generators";
import syntaxClassProperties from "@babel/plugin-syntax-class-properties";
import syntaxDecorators from "@babel/plugin-syntax-decorators";
import syntaxDoExpressions from "@babel/plugin-syntax-do-expressions";
import syntaxEventualSend from "@babel/plugin-syntax-eventual-send";
import syntaxExportDefaultFrom from "@babel/plugin-syntax-export-default-from";
import syntaxFlow from "@babel/plugin-syntax-flow";
import syntaxFunctionBind from "@babel/plugin-syntax-function-bind";
import syntaxFunctionSent from "@babel/plugin-syntax-function-sent";
import syntaxImportMeta from "@babel/plugin-syntax-import-meta";
import syntaxJsx from "@babel/plugin-syntax-jsx";
import syntaxModuleAttributes from "@babel/plugin-syntax-module-attributes";
import syntaxObjectRestSpread from "@babel/plugin-syntax-object-rest-spread";
import syntaxOptionalCatchBinding from "@babel/plugin-syntax-optional-catch-binding";
import syntaxPipelineOperator from "@babel/plugin-syntax-pipeline-operator";
import syntaxRecordAndTuple from "@babel/plugin-syntax-record-and-tuple";
import syntaxTopLevelAwait from "@babel/plugin-syntax-top-level-await";
import syntaxTypescript from "@babel/plugin-syntax-typescript";
import proposalAsyncGeneratorFunctions from "@babel/plugin-proposal-async-generator-functions";
import proposalClassProperties from "@babel/plugin-proposal-class-properties";
import proposalDecorators from "@babel/plugin-proposal-decorators";
import proposalDoExpressions from "@babel/plugin-proposal-do-expressions";
import proposalDynamicImport from "@babel/plugin-proposal-dynamic-import";
import proposalEventualSend from "@babel/plugin-proposal-eventual-send";
import proposalExportDefaultFrom from "@babel/plugin-proposal-export-default-from";
import proposalExportNamespaceFrom from "@babel/plugin-proposal-export-namespace-from";
import proposalFunctionBind from "@babel/plugin-proposal-function-bind";
import proposalFunctionSent from "@babel/plugin-proposal-function-sent";
import proposalJsonStrings from "@babel/plugin-proposal-json-strings";
import proposalLogicalAssignmentOperators from "@babel/plugin-proposal-logical-assignment-operators";
import proposalNullishCoalescingOperator from "@babel/plugin-proposal-nullish-coalescing-operator";
import proposalNumericSeparator from "@babel/plugin-proposal-numeric-separator";
import proposalObjectRestSpread from "@babel/plugin-proposal-object-rest-spread";
import proposalOptionalCatchBinding from "@babel/plugin-proposal-optional-catch-binding";
import proposalOptionalChaining from "@babel/plugin-proposal-optional-chaining";
import proposalPipelineOperator from "@babel/plugin-proposal-pipeline-operator";
import proposalPrivateMethods from "@babel/plugin-proposal-private-methods";
import proposalPrivatePropertyInObject from "@babel/plugin-proposal-private-property-in-object";
import proposalThrowExpressions from "@babel/plugin-proposal-throw-expressions";
import proposalUnicodePropertyRegex from "@babel/plugin-proposal-unicode-property-regex";
import transformAsyncToGenerator from "@babel/plugin-transform-async-to-generator";
import transformArrowFunctions from "@babel/plugin-transform-arrow-functions";
import transformBlockScopedFunctions from "@babel/plugin-transform-block-scoped-functions";
import transformBlockScoping from "@babel/plugin-transform-block-scoping";
import transformClasses from "@babel/plugin-transform-classes";
import transformComputedProperties from "@babel/plugin-transform-computed-properties";
import transformDestructuring from "@babel/plugin-transform-destructuring";
import transformDotallRegex from "@babel/plugin-transform-dotall-regex";
import transformDuplicateKeys from "@babel/plugin-transform-duplicate-keys";
import transformExponentiationOperator from "@babel/plugin-transform-exponentiation-operator";
import transformFlowComments from "@babel/plugin-transform-flow-comments";
import transformFlowStripTypes from "@babel/plugin-transform-flow-strip-types";
import transformForOf from "@babel/plugin-transform-for-of";
import transformFunctionName from "@babel/plugin-transform-function-name";
import transformInstanceof from "@babel/plugin-transform-instanceof";
import transformJscript from "@babel/plugin-transform-jscript";
import transformLiterals from "@babel/plugin-transform-literals";
import transformMemberExpressionLiterals from "@babel/plugin-transform-member-expression-literals";
import transformModulesAmd from "@babel/plugin-transform-modules-amd";
import transformModulesCommonjs from "@babel/plugin-transform-modules-commonjs";
import transformModulesSystemjs from "@babel/plugin-transform-modules-systemjs";
import transformModulesUmd from "@babel/plugin-transform-modules-umd";
import transformNamedCapturingGroupsRegex from "@babel/plugin-transform-named-capturing-groups-regex";
import transformNewTarget from "@babel/plugin-transform-new-target";
import transformObjectAssign from "@babel/plugin-transform-object-assign";
import transformObjectSuper from "@babel/plugin-transform-object-super";
import transformObjectSetPrototypeOfToAssign from "@babel/plugin-transform-object-set-prototype-of-to-assign";
import transformParameters from "@babel/plugin-transform-parameters";
import transformPropertyLiterals from "@babel/plugin-transform-property-literals";
import transformPropertyMutators from "@babel/plugin-transform-property-mutators";
import transformProtoToAssign from "@babel/plugin-transform-proto-to-assign";
import transformReactConstantElements from "@babel/plugin-transform-react-constant-elements";
import transformReactDisplayName from "@babel/plugin-transform-react-display-name";
import transformReactInlineElements from "@babel/plugin-transform-react-inline-elements";
import transformReactJsx from "@babel/plugin-transform-react-jsx";
import transformReactJsxCompat from "@babel/plugin-transform-react-jsx-compat";
import transformReactJsxDevelopment from "@babel/plugin-transform-react-jsx-development";
import transformReactJsxSelf from "@babel/plugin-transform-react-jsx-self";
import transformReactJsxSource from "@babel/plugin-transform-react-jsx-source";
import transformRegenerator from "@babel/plugin-transform-regenerator";
import transformReservedWords from "@babel/plugin-transform-reserved-words";
import transformRuntime from "@babel/plugin-transform-runtime";
import transformShorthandProperties from "@babel/plugin-transform-shorthand-properties";
import transformSpread from "@babel/plugin-transform-spread";
import transformStickyRegex from "@babel/plugin-transform-sticky-regex";
import transformStrictMode from "@babel/plugin-transform-strict-mode";
import transformTemplateLiterals from "@babel/plugin-transform-template-literals";
import transformTypeofSymbol from "@babel/plugin-transform-typeof-symbol";
import transformTypescript from "@babel/plugin-transform-typescript";
import transformUnicodeEscapes from "@babel/plugin-transform-unicode-escapes";
import transformUnicodeRegex from "@babel/plugin-transform-unicode-regex";

export {
  externalHelpers,
  syntaxAsyncGenerators,
  syntaxClassProperties,
  syntaxDecorators,
  syntaxDoExpressions,
  syntaxEventualSend,
  syntaxExportDefaultFrom,
  syntaxFlow,
  syntaxFunctionBind,
  syntaxFunctionSent,
  syntaxImportMeta,
  syntaxJsx,
  syntaxModuleAttributes,
  syntaxObjectRestSpread,
  syntaxOptionalCatchBinding,
  syntaxPipelineOperator,
  syntaxRecordAndTuple,
  syntaxTopLevelAwait,
  syntaxTypescript,
  proposalAsyncGeneratorFunctions,
  proposalClassProperties,
  proposalDecorators,
  proposalDoExpressions,
  proposalDynamicImport,
  proposalEventualSend,
  proposalExportDefaultFrom,
  proposalExportNamespaceFrom,
  proposalFunctionBind,
  proposalFunctionSent,
  proposalJsonStrings,
  proposalLogicalAssignmentOperators,
  proposalNullishCoalescingOperator,
  proposalNumericSeparator,
  proposalObjectRestSpread,
  proposalOptionalCatchBinding,
  proposalOptionalChaining,
  proposalPipelineOperator,
  proposalPrivateMethods,
  proposalPrivatePropertyInObject,
  proposalThrowExpressions,
  proposalUnicodePropertyRegex,
  transformAsyncToGenerator,
  transformArrowFunctions,
  transformBlockScopedFunctions,
  transformBlockScoping,
  transformClasses,
  transformComputedProperties,
  transformDestructuring,
  transformDotallRegex,
  transformDuplicateKeys,
  transformExponentiationOperator,
  transformFlowComments,
  transformFlowStripTypes,
  transformForOf,
  transformFunctionName,
  transformInstanceof,
  transformJscript,
  transformLiterals,
  transformMemberExpressionLiterals,
  transformModulesAmd,
  transformModulesCommonjs,
  transformModulesSystemjs,
  transformModulesUmd,
  transformNamedCapturingGroupsRegex,
  transformNewTarget,
  transformObjectAssign,
  transformObjectSuper,
  transformObjectSetPrototypeOfToAssign,
  transformParameters,
  transformPropertyLiterals,
  transformPropertyMutators,
  transformProtoToAssign,
  transformReactConstantElements,
  transformReactDisplayName,
  transformReactInlineElements,
  transformReactJsx,
  transformReactJsxCompat,
  transformReactJsxDevelopment,
  transformReactJsxSelf,
  transformReactJsxSource,
  transformRegenerator,
  transformReservedWords,
  transformRuntime,
  transformShorthandProperties,
  transformSpread,
  transformStickyRegex,
  transformStrictMode,
  transformTemplateLiterals,
  transformTypeofSymbol,
  transformTypescript,
  transformUnicodeEscapes,
  transformUnicodeRegex,
};

export const all = {
  "external-helpers": externalHelpers,
  "syntax-async-generators": syntaxAsyncGenerators,
  "syntax-class-properties": syntaxClassProperties,
  "syntax-decorators": syntaxDecorators,
  "syntax-do-expressions": syntaxDoExpressions,
  "syntax-eventual-send": syntaxEventualSend,
  "syntax-export-default-from": syntaxExportDefaultFrom,
  "syntax-flow": syntaxFlow,
  "syntax-function-bind": syntaxFunctionBind,
  "syntax-function-sent": syntaxFunctionSent,
  "syntax-import-meta": syntaxImportMeta,
  "syntax-jsx": syntaxJsx,
  "syntax-module-attributes": syntaxModuleAttributes,
  "syntax-object-rest-spread": syntaxObjectRestSpread,
  "syntax-optional-catch-binding": syntaxOptionalCatchBinding,
  "syntax-pipeline-operator": syntaxPipelineOperator,
  "syntax-record-and-tuple": syntaxRecordAndTuple,
  "syntax-top-level-await": syntaxTopLevelAwait,
  "syntax-typescript": syntaxTypescript,
  "proposal-async-generator-functions": proposalAsyncGeneratorFunctions,
  "proposal-class-properties": proposalClassProperties,
  "proposal-decorators": proposalDecorators,
  "proposal-do-expressions": proposalDoExpressions,
  "proposal-dynamic-import": proposalDynamicImport,
  "proposal-eventual-send": proposalEventualSend,
  "proposal-export-default-from": proposalExportDefaultFrom,
  "proposal-export-namespace-from": proposalExportNamespaceFrom,
  "proposal-function-bind": proposalFunctionBind,
  "proposal-function-sent": proposalFunctionSent,
  "proposal-json-strings": proposalJsonStrings,
  "proposal-logical-assignment-operators": proposalLogicalAssignmentOperators,
  "proposal-nullish-coalescing-operator": proposalNullishCoalescingOperator,
  "proposal-numeric-separator": proposalNumericSeparator,
  "proposal-object-rest-spread": proposalObjectRestSpread,
  "proposal-optional-catch-binding": proposalOptionalCatchBinding,
  "proposal-optional-chaining": proposalOptionalChaining,
  "proposal-pipeline-operator": proposalPipelineOperator,
  "proposal-private-methods": proposalPrivateMethods,
  "proposal-private-property-in-object": proposalPrivatePropertyInObject,
  "proposal-throw-expressions": proposalThrowExpressions,
  "proposal-unicode-property-regex": proposalUnicodePropertyRegex,
  "transform-async-to-generator": transformAsyncToGenerator,
  "transform-arrow-functions": transformArrowFunctions,
  "transform-block-scoped-functions": transformBlockScopedFunctions,
  "transform-block-scoping": transformBlockScoping,
  "transform-classes": transformClasses,
  "transform-computed-properties": transformComputedProperties,
  "transform-destructuring": transformDestructuring,
  "transform-dotall-regex": transformDotallRegex,
  "transform-duplicate-keys": transformDuplicateKeys,
  "transform-exponentiation-operator": transformExponentiationOperator,
  "transform-flow-comments": transformFlowComments,
  "transform-flow-strip-types": transformFlowStripTypes,
  "transform-for-of": transformForOf,
  "transform-function-name": transformFunctionName,
  "transform-instanceof": transformInstanceof,
  "transform-jscript": transformJscript,
  "transform-literals": transformLiterals,
  "transform-member-expression-literals": transformMemberExpressionLiterals,
  "transform-modules-amd": transformModulesAmd,
  "transform-modules-commonjs": transformModulesCommonjs,
  "transform-modules-systemjs": transformModulesSystemjs,
  "transform-modules-umd": transformModulesUmd,
  "transform-named-capturing-groups-regex": transformNamedCapturingGroupsRegex,
  "transform-new-target": transformNewTarget,
  "transform-object-assign": transformObjectAssign,
  "transform-object-super": transformObjectSuper,
  "transform-object-set-prototype-of-to-assign": transformObjectSetPrototypeOfToAssign,
  "transform-parameters": transformParameters,
  "transform-property-literals": transformPropertyLiterals,
  "transform-property-mutators": transformPropertyMutators,
  "transform-proto-to-assign": transformProtoToAssign,
  "transform-react-constant-elements": transformReactConstantElements,
  "transform-react-display-name": transformReactDisplayName,
  "transform-react-inline-elements": transformReactInlineElements,
  "transform-react-jsx": transformReactJsx,
  "transform-react-jsx-compat": transformReactJsxCompat,
  "transform-react-jsx-development": transformReactJsxDevelopment,
  "transform-react-jsx-self": transformReactJsxSelf,
  "transform-react-jsx-source": transformReactJsxSource,
  "transform-regenerator": transformRegenerator,
  "transform-reserved-words": transformReservedWords,
  "transform-runtime": transformRuntime,
  "transform-shorthand-properties": transformShorthandProperties,
  "transform-spread": transformSpread,
  "transform-sticky-regex": transformStickyRegex,
  "transform-strict-mode": transformStrictMode,
  "transform-template-literals": transformTemplateLiterals,
  "transform-typeof-symbol": transformTypeofSymbol,
  "transform-typescript": transformTypescript,
  "transform-unicode-escapes": transformUnicodeEscapes,
  "transform-unicode-regex": transformUnicodeRegex,
};
