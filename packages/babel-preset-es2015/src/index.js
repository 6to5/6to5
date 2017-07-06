import transformES2015TemplateLiterals from "babel-plugin-transform-es2015-template-literals";
import transformES2015Literals from "babel-plugin-transform-es2015-literals";
import transformES2015FunctionName from "babel-plugin-transform-es2015-function-name";
import transformES2015ArrowFunctions from "babel-plugin-transform-es2015-arrow-functions";
import transformES2015BlockScopedFunctions from "babel-plugin-transform-es2015-block-scoped-functions";
import transformES2015Classes from "babel-plugin-transform-es2015-classes";
import transformES2015ObjectSuper from "babel-plugin-transform-es2015-object-super";
import transformES2015ShorthandProperties from "babel-plugin-transform-es2015-shorthand-properties";
import transformES2015DuplicateKeys from "babel-plugin-transform-es2015-duplicate-keys";
import transformES2015ComputedProperties from "babel-plugin-transform-es2015-computed-properties";
import transformES2015ForOf from "babel-plugin-transform-es2015-for-of";
import transformES2015StickyRegex from "babel-plugin-transform-es2015-sticky-regex";
import transformES2015UnicodeRegex from "babel-plugin-transform-es2015-unicode-regex";
import checkES2015Constants from "babel-plugin-check-es2015-constants";
import transformES2015Spread from "babel-plugin-transform-es2015-spread";
import transformES2015Parameters from "babel-plugin-transform-es2015-parameters";
import transformES2015Destructuring from "babel-plugin-transform-es2015-destructuring";
import transformES2015BlockScoping from "babel-plugin-transform-es2015-block-scoping";
import transformES2015TypeofSymbol from "babel-plugin-transform-es2015-typeof-symbol";
import transformES2015ModulesCommonJS from "babel-plugin-transform-es2015-modules-commonjs";
import transformES2015ModulesSystemJS from "babel-plugin-transform-es2015-modules-systemjs";
import transformES2015ModulesAMD from "babel-plugin-transform-es2015-modules-amd";
import transformES2015ModulesUMD from "babel-plugin-transform-es2015-modules-umd";
import transformRegenerator from "babel-plugin-transform-regenerator";

export default function(context, opts = {}) {
  const moduleTypes = ["commonjs", "amd", "umd", "systemjs"];
  let loose = false;
  let modules = "commonjs";
  let spec = false;

  if (opts !== undefined) {
    if (opts.loose !== undefined) loose = opts.loose;
    if (opts.modules !== undefined) modules = opts.modules;
    if (opts.spec !== undefined) spec = opts.spec;
  }

  if (typeof loose !== "boolean") {
    throw new Error("Preset es2015 'loose' option must be a boolean.");
  }
  if (typeof spec !== "boolean") {
    throw new Error("Preset es2015 'spec' option must be a boolean.");
  }
  if (modules !== false && moduleTypes.indexOf(modules) === -1) {
    throw new Error(
      "Preset es2015 'modules' option must be 'false' to indicate no modules\n" +
        "or a module type which be be one of: 'commonjs' (default), 'amd', 'umd', 'systemjs'",
    );
  }

  // be DRY
  const optsLoose = { loose };

  return {
    plugins: [
      [transformES2015TemplateLiterals, { loose, spec }],
      transformES2015Literals,
      transformES2015FunctionName,
      [transformES2015ArrowFunctions, { spec }],
      transformES2015BlockScopedFunctions,
      [transformES2015Classes, optsLoose],
      transformES2015ObjectSuper,
      transformES2015ShorthandProperties,
      transformES2015DuplicateKeys,
      [transformES2015ComputedProperties, optsLoose],
      [transformES2015ForOf, optsLoose],
      transformES2015StickyRegex,
      transformES2015UnicodeRegex,
      checkES2015Constants,
      [transformES2015Spread, optsLoose],
      transformES2015Parameters,
      [transformES2015Destructuring, optsLoose],
      transformES2015BlockScoping,
      transformES2015TypeofSymbol,
      modules === "commonjs" && [transformES2015ModulesCommonJS, optsLoose],
      modules === "systemjs" && [transformES2015ModulesSystemJS, optsLoose],
      modules === "amd" && [transformES2015ModulesAMD, optsLoose],
      modules === "umd" && [transformES2015ModulesUMD, optsLoose],
      [transformRegenerator, { async: false, asyncGenerators: false }],
    ].filter(Boolean), // filter out falsy values
  };
}
