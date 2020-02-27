import { declare } from "@babel/helper-plugin-utils";
import transformTypeScript from "@babel/plugin-transform-typescript";

export default declare(
  (
    api,
    {
      allExtensions = false,
      allowDeclareFields,
      allowNamespaces,
      jsxPragma,
      isTSX = false,
      onlyRemoveTypeImports,
    },
  ) => {
    api.assertVersion(7);

    if (typeof allExtensions !== "boolean") {
      throw new Error(".allExtensions must be a boolean, or undefined");
    }

    if (typeof isTSX !== "boolean") {
      throw new Error(".isTSX must be a boolean, or undefined");
    }

    if (isTSX && !allExtensions) {
      throw new Error("isTSX:true requires allExtensions:true");
    }

    const pluginOptions = isTSX => ({
      allowDeclareFields,
      allowNamespaces,
      isTSX,
      jsxPragma,
      onlyRemoveTypeImports,
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
  },
);
