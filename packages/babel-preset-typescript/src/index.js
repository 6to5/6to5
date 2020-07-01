import { declare } from "@babel/helper-plugin-utils";
import transformTypeScript from "@babel/plugin-transform-typescript";
import syntaxJSX from "@babel/plugin-syntax-jsx";
import normalizeOptions from "./normalize-options";

export default declare((api, opts) => {
  api.assertVersion(7);

  const {
    ignoreExtensions,
    allowNamespaces,
    jsxPragma,
    onlyRemoveTypeImports,
  } = normalizeOptions(opts);

  const pluginOptions = {
    allowNamespaces,
    jsxPragma,
    onlyRemoveTypeImports,
  };

  const tsPlugins = [[transformTypeScript, pluginOptions]];
  const tsxPlugins = [[transformTypeScript, pluginOptions], syntaxJSX];

  if (ignoreExtensions) {
    return { plugins: tsPlugins };
  }

  return {
    overrides: [
      {
        test: filename => filename == null || filename.endsWith(".ts"),
        plugins: tsPlugins,
      },
      {
        test: filename => filename?.endsWith(".tsx"),
        plugins: tsxPlugins,
      },
    ],
  };
});
