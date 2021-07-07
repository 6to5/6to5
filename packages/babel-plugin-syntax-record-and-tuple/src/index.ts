import { declare } from "@babel/helper-plugin-utils";

export default declare((api, options) => {
  api.assertVersion(7);

  return {
    name: "syntax-record-and-tuple",

    manipulateOptions(opts, parserOpts) {
      opts.generatorOpts.recordAndTupleSyntaxType = options.syntaxType;

      parserOpts.plugins.push([
        "recordAndTuple",
        { syntaxType: options.syntaxType },
      ]);
    },
  };
});
