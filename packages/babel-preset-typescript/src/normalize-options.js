import { OptionValidator } from "@babel/helper-validator-option";
const v = new OptionValidator("@babel/preset-typescript");

export default function normalizeOptions(options = {}) {
  let { allowNamespaces = true, jsxPragma, onlyRemoveTypeImports } = options;

  const TopLevelOptions = {
    allExtensions: "allExtensions",
    allowNamespaces: "allowNamespaces",
    isTSX: "isTSX",
    jsxPragma: "jsxPragma",
    jsxPragmaFrag: "jsxPragmaFrag",
    onlyRemoveTypeImports: "onlyRemoveTypeImports",
    optimizeConstEnums: "optimizeConstEnums",
  };

  if (process.env.BABEL_8_BREAKING) {
    v.validateTopLevelOptions(options, TopLevelOptions);
    allowNamespaces = v.validateBooleanOption(
      TopLevelOptions.allowNamespaces,
      options.allowNamespaces,
      true,
    );
    jsxPragma = v.validateStringOption(
      TopLevelOptions.jsxPragma,
      options.jsxPragma,
      "React",
    );
    onlyRemoveTypeImports = v.validateBooleanOption(
      TopLevelOptions.onlyRemoveTypeImports,
      options.onlyRemoveTypeImports,
      true,
    );
  }

  const jsxPragmaFrag = v.validateStringOption(
    TopLevelOptions.jsxPragmaFrag,
    options.jsxPragmaFrag,
    "React.Fragment",
  );

  const allExtensions = v.validateBooleanOption(
    TopLevelOptions.allExtensions,
    options.allExtensions,
    false,
  );

  const isTSX = v.validateBooleanOption(
    TopLevelOptions.isTSX,
    options.isTSX,
    false,
  );
  if (isTSX) {
    v.invariant(allExtensions, "isTSX:true requires allExtensions:true");
  }

  const optimizeConstEnums = v.validateBooleanOption(
    TopLevelOptions.optimizeConstEnums,
    options.optimizeConstEnums,
    false,
  );

  return {
    allExtensions,
    allowNamespaces,
    isTSX,
    jsxPragma,
    jsxPragmaFrag,
    onlyRemoveTypeImports,
    optimizeConstEnums,
  };
}
