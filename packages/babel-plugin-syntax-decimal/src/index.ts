import { declare } from "@babel/helper-plugin-utils";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "syntax-decimal",

    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("decimal");
    },
  };
});
