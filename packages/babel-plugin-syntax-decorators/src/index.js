import { declare } from "@babel/helper-plugin-utils";

export default declare((api, options) => {
  api.assertVersion(7);

  const { legacy = false } = options;
  if (typeof legacy !== "boolean") {
    throw new Error("'legacy' must be a boolean.");
  }

  if (process.env.BABEL_8_BREAKING) {
    if (!legacy) {
      throw new Error(
        "Babel 8 only supports legacy decorators. Please pass the" +
          ' `"legacy": true` option to `@babel/plugin-syntax-decorators`',
      );
    }
  } else {
    // eslint-disable-next-line no-var
    var { decoratorsBeforeExport } = options;
    if (decoratorsBeforeExport === undefined) {
      if (!legacy) {
        throw new Error(
          "The '@babel/plugin-syntax-decorators' plugin requires a" +
            " 'decoratorsBeforeExport' option, whose value must be a boolean." +
            " If you want to use the legacy decorators semantics, you can set" +
            " the 'legacy: true' option.",
        );
      }
    } else {
      if (legacy) {
        throw new Error(
          "'decoratorsBeforeExport' can't be used with legacy decorators.",
        );
      }
      if (typeof decoratorsBeforeExport !== "boolean") {
        throw new Error("'decoratorsBeforeExport' must be a boolean.");
      }
    }
  }

  return {
    name: "syntax-decorators",

    manipulateOptions(opts, parserOpts) {
      if (process.env.BABEL_8_BREAKING) {
        parserOpts.plugins.push("decorators-legacy");
      } else {
        parserOpts.plugins.push(
          legacy
            ? "decorators-legacy"
            : ["decorators", { decoratorsBeforeExport }],
        );
      }
    },
  };
});
