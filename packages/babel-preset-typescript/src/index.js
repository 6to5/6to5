import { declare } from "@babel/helper-plugin-utils";
import transformTypeScript from "@babel/plugin-transform-typescript";
import normalizeOptions from "./normalize-options";

export default declare((api, opts) => {
  api.assertVersion(7);

  const {
    allExtensions,
    allowNamespaces,
    isTSX,
    jsxPragma,
    jsxPragmaFrag,
    onlyRemoveTypeImports,
    optimizeConstEnums,
  } = normalizeOptions(opts);

  const pluginOptions = process.env.BABEL_8_BREAKING
    ? isTSX => ({
        allowNamespaces,
        isTSX,
        jsxPragma,
        jsxPragmaFrag,
        onlyRemoveTypeImports,
        optimizeConstEnums,
      })
    : isTSX => ({
        allowDeclareFields: opts.allowDeclareFields,
        allowNamespaces,
        isTSX,
        jsxPragma,
        jsxPragmaFrag,
        onlyRemoveTypeImports,
        optimizeConstEnums,
      });

  return {
    overrides: allExtensions
      ? [
          {
            plugins: [[transformTypeScript, pluginOptions(isTSX)]],
          },
        ]
      : [
          {
            // Only set 'test' if explicitly requested, since it requires that
            // Babel is being called`
            test: /\.ts$/,
            plugins: [[transformTypeScript, pluginOptions(false)]],
          },
          {
            // Only set 'test' if explicitly requested, since it requires that
            // Babel is being called`
            test: /\.tsx$/,
            plugins: [[transformTypeScript, pluginOptions(true)]],
          },
        ],
  };
});
