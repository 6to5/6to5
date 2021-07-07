import { declare } from "@babel/helper-plugin-utils";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "syntax-private-property-in-object",

    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("privateIn");
    },
  };
});
