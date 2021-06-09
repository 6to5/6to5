// @flow
/* eslint-disable import/extensions */
/* eslint sort-keys: "error" */

import syntaxAsyncGenerators from "@babel/plugin-syntax-async-generators";
import syntaxClassProperties from "@babel/plugin-syntax-class-properties";
import syntaxClassStaticBlock from "@babel/plugin-syntax-class-static-block";
import syntaxDynamicImport from "@babel/plugin-syntax-dynamic-import";
import syntaxExportNamespaceFrom from "@babel/plugin-syntax-export-namespace-from";
import syntaxJsonStrings from "@babel/plugin-syntax-json-strings";
import syntaxLogicalAssignmentOperators from "@babel/plugin-syntax-logical-assignment-operators";
import syntaxNullishCoalescingOperator from "@babel/plugin-syntax-nullish-coalescing-operator";
import syntaxNumericSeparator from "@babel/plugin-syntax-numeric-separator";
import syntaxObjectRestSpread from "@babel/plugin-syntax-object-rest-spread";
import syntaxOptionalCatchBinding from "@babel/plugin-syntax-optional-catch-binding";
import syntaxOptionalChaining from "@babel/plugin-syntax-optional-chaining";
import syntaxPrivatePropertyInObject from "@babel/plugin-syntax-private-property-in-object";
import syntaxTopLevelAwait from "@babel/plugin-syntax-top-level-await";
import proposalAsyncGeneratorFunctions from "@babel/plugin-proposal-async-generator-functions";
import proposalClassProperties from "@babel/plugin-proposal-class-properties";
import proposalClassStaticBlock from "@babel/plugin-proposal-class-static-block";
import proposalDynamicImport from "@babel/plugin-proposal-dynamic-import";
import proposalExportNamespaceFrom from "@babel/plugin-proposal-export-namespace-from";
import proposalJsonStrings from "@babel/plugin-proposal-json-strings";
import proposalLogicalAssignmentOperators from "@babel/plugin-proposal-logical-assignment-operators";
import proposalNullishCoalescingOperator from "@babel/plugin-proposal-nullish-coalescing-operator";
import proposalNumericSeparator from "@babel/plugin-proposal-numeric-separator";
import proposalObjectRestSpread from "@babel/plugin-proposal-object-rest-spread";
import proposalOptionalCatchBinding from "@babel/plugin-proposal-optional-catch-binding";
import proposalOptionalChaining from "@babel/plugin-proposal-optional-chaining";
import proposalPrivateMethods from "@babel/plugin-proposal-private-methods";
import proposalPrivatePropertyInObject from "@babel/plugin-proposal-private-property-in-object";
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
import transformExponentialOperator from "@babel/plugin-transform-exponentiation-operator";
import transformForOf from "@babel/plugin-transform-for-of";
import transformFunctionName from "@babel/plugin-transform-function-name";
import transformLiterals from "@babel/plugin-transform-literals";
import transformMemberExpressionLiterals from "@babel/plugin-transform-member-expression-literals";
import transformModulesAmd from "@babel/plugin-transform-modules-amd";
import transformModulesCommonjs from "@babel/plugin-transform-modules-commonjs";
import transformModulesSystemjs from "@babel/plugin-transform-modules-systemjs";
import transformModulesUmd from "@babel/plugin-transform-modules-umd";
import transformNamedCapturingGroupsRegex from "@babel/plugin-transform-named-capturing-groups-regex";
import transformNewTarget from "@babel/plugin-transform-new-target";
import transformObjectSuper from "@babel/plugin-transform-object-super";
import transformParameters from "@babel/plugin-transform-parameters";
import transformPropertyLiterals from "@babel/plugin-transform-property-literals";
import transformRegenerator from "@babel/plugin-transform-regenerator";
import transformReservedWords from "@babel/plugin-transform-reserved-words";
import transformShorthandProperties from "@babel/plugin-transform-shorthand-properties";
import transformSpread from "@babel/plugin-transform-spread";
import transformStickyRegex from "@babel/plugin-transform-sticky-regex";
import transformTemplateLiterals from "@babel/plugin-transform-template-literals";
import transformTypeofSymbol from "@babel/plugin-transform-typeof-symbol";
import transformUnicodeEscapes from "@babel/plugin-transform-unicode-escapes";
import transformUnicodeRegex from "@babel/plugin-transform-unicode-regex";

import bugfixAsyncArrowsInClass from "@babel/preset-modules/lib/plugins/transform-async-arrows-in-class/index.js";
import bugfixEdgeDefaultParameters from "@babel/preset-modules/lib/plugins/transform-edge-default-parameters/index.js";
import bugfixEdgeFunctionName from "@babel/preset-modules/lib/plugins/transform-edge-function-name/index.js";
import bugfixTaggedTemplateCaching from "@babel/preset-modules/lib/plugins/transform-tagged-template-caching/index.js";
import bugfixSafariBlockShadowing from "@babel/preset-modules/lib/plugins/transform-safari-block-shadowing/index.js";
import bugfixSafariForShadowing from "@babel/preset-modules/lib/plugins/transform-safari-for-shadowing/index.js";
import bugfixV8SpreadParametersInOptionalChaining from "@babel/plugin-bugfix-v8-spread-parameters-in-optional-chaining";

export default {
  "bugfix/transform-async-arrows-in-class": () => bugfixAsyncArrowsInClass,
  "bugfix/transform-edge-default-parameters": () => bugfixEdgeDefaultParameters,
  "bugfix/transform-edge-function-name": () => bugfixEdgeFunctionName,
  "bugfix/transform-safari-block-shadowing": () => bugfixSafariBlockShadowing,
  "bugfix/transform-safari-for-shadowing": () => bugfixSafariForShadowing,
  "bugfix/transform-tagged-template-caching": () => bugfixTaggedTemplateCaching,
  "bugfix/transform-v8-spread-parameters-in-optional-chaining": () =>
    bugfixV8SpreadParametersInOptionalChaining,
  "proposal-async-generator-functions": () => proposalAsyncGeneratorFunctions,
  "proposal-class-properties": () => proposalClassProperties,
  "proposal-class-static-block": () => proposalClassStaticBlock,
  "proposal-dynamic-import": () => proposalDynamicImport,
  "proposal-export-namespace-from": () => proposalExportNamespaceFrom,
  "proposal-json-strings": () => proposalJsonStrings,
  "proposal-logical-assignment-operators": () =>
    proposalLogicalAssignmentOperators,
  "proposal-nullish-coalescing-operator": () =>
    proposalNullishCoalescingOperator,
  "proposal-numeric-separator": () => proposalNumericSeparator,
  "proposal-object-rest-spread": () => proposalObjectRestSpread,
  "proposal-optional-catch-binding": () => proposalOptionalCatchBinding,
  "proposal-optional-chaining": () => proposalOptionalChaining,
  "proposal-private-methods": () => proposalPrivateMethods,
  "proposal-private-property-in-object": () => proposalPrivatePropertyInObject,
  "proposal-unicode-property-regex": () => proposalUnicodePropertyRegex,
  "syntax-async-generators": () => syntaxAsyncGenerators,
  "syntax-class-properties": () => syntaxClassProperties,
  "syntax-class-static-block": () => syntaxClassStaticBlock,
  "syntax-dynamic-import": () => syntaxDynamicImport,
  "syntax-export-namespace-from": () => syntaxExportNamespaceFrom,
  "syntax-json-strings": () => syntaxJsonStrings,
  "syntax-logical-assignment-operators": () => syntaxLogicalAssignmentOperators,
  "syntax-nullish-coalescing-operator": () => syntaxNullishCoalescingOperator,
  "syntax-numeric-separator": () => syntaxNumericSeparator,
  "syntax-object-rest-spread": () => syntaxObjectRestSpread,
  "syntax-optional-catch-binding": () => syntaxOptionalCatchBinding,
  "syntax-optional-chaining": () => syntaxOptionalChaining,
  "syntax-private-property-in-object": () => syntaxPrivatePropertyInObject,
  "syntax-top-level-await": () => syntaxTopLevelAwait,
  "transform-arrow-functions": () => transformArrowFunctions,
  "transform-async-to-generator": () => transformAsyncToGenerator,
  "transform-block-scoped-functions": () => transformBlockScopedFunctions,
  "transform-block-scoping": () => transformBlockScoping,
  "transform-classes": () => transformClasses,
  "transform-computed-properties": () => transformComputedProperties,
  "transform-destructuring": () => transformDestructuring,
  "transform-dotall-regex": () => transformDotallRegex,
  "transform-duplicate-keys": () => transformDuplicateKeys,
  "transform-exponentiation-operator": () => transformExponentialOperator,
  "transform-for-of": () => transformForOf,
  "transform-function-name": () => transformFunctionName,
  "transform-literals": () => transformLiterals,
  "transform-member-expression-literals": () =>
    transformMemberExpressionLiterals,
  "transform-modules-amd": () => transformModulesAmd,
  "transform-modules-commonjs": () => transformModulesCommonjs,
  "transform-modules-systemjs": () => transformModulesSystemjs,
  "transform-modules-umd": () => transformModulesUmd,
  "transform-named-capturing-groups-regex": () =>
    transformNamedCapturingGroupsRegex,
  "transform-new-target": () => transformNewTarget,
  "transform-object-super": () => transformObjectSuper,
  "transform-parameters": () => transformParameters,
  "transform-property-literals": () => transformPropertyLiterals,
  "transform-regenerator": () => transformRegenerator,
  "transform-reserved-words": () => transformReservedWords,
  "transform-shorthand-properties": () => transformShorthandProperties,
  "transform-spread": () => transformSpread,
  "transform-sticky-regex": () => transformStickyRegex,
  "transform-template-literals": () => transformTemplateLiterals,
  "transform-typeof-symbol": () => transformTypeofSymbol,
  "transform-unicode-escapes": () => transformUnicodeEscapes,
  "transform-unicode-regex": () => transformUnicodeRegex,
};

export const minVersions = {
  "proposal-class-static-block": "7.12.0",
  "proposal-private-property-in-object": "7.10.0",
};
