import { declare } from "@babel/helper-plugin-utils";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "syntax-partial-application",

    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("partialApplication");
    },
  };
});
