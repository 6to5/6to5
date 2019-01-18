import { declare } from "@babel/helper-plugin-utils";

export default declare((api, options) => {
  api.assertVersion(7);

  const { legacy = false } = options;
  if (typeof legacy !== "boolean") {
    throw new Error("'legacy' must be a boolean.");
  }

  const { version: proposalVersion = legacy ? "legacy" : "nov-2018" } = options;
  if (legacy && proposalVersion !== "legacy") {
    throw new Error(
      "'legacy' and 'version' can't be used together, since" +
        " 'legacy: true' is an alias for 'version: \"legacy\"'.",
    );
  } else if (
    proposalVersion !== "legacy" &&
    proposalVersion !== "nov-2018" &&
    proposalVersion !== "jan-2019"
  ) {
    throw new Error(
      "'version' must be either 'legacy', 'nov-2018' (default) or" +
        " 'jan-2019' (recommended).",
    );
  }

  const { decoratorsBeforeExport } = options;
  if (decoratorsBeforeExport === undefined) {
    if (proposalVersion === "nov-2018") {
      throw new Error(
        "The decorators plugin requires a 'decoratorsBeforeExport' option," +
          " whose value must be a boolean. If you want to use the legacy" +
          " decorators semantics, you can set the 'legacy: true' option.",
      );
    }
  } else {
    if (proposalVersion !== "nov-2018") {
      throw new Error(
        "'decoratorsBeforeExport' can only be used for" +
          " 'version: \"nov-2018\"' decorators. It defaults to true for" +
          " 'version: \"legacy\"' and to false for 'version: \"jan-2019\"'.",
      );
    }
    if (typeof decoratorsBeforeExport !== "boolean") {
      throw new Error("'decoratorsBeforeExport' must be a boolean.");
    }
  }

  return {
    name: "syntax-decorators",

    manipulateOptions(opts, parserOpts) {
      if (proposalVersion === "legacy") {
        parserOpts.plugins.push("decorators-legacy");
      } else {
        parserOpts.plugins.push([
          "decorators",
          { decoratorsBeforeExport: !!decoratorsBeforeExport },
        ]);
      }
    },
  };
});
