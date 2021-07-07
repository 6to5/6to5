import { declare } from "@babel/helper-plugin-utils";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "syntax-top-level-await",

    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("topLevelAwait");
    },
  };
});
