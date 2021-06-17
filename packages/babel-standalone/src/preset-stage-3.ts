import * as babelPlugins from "./generated/plugins";

export default (_: any, opts: any) => {
  let loose = false;

  if (opts !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (opts.loose !== undefined) loose = opts.loose;
  }

  return {
    plugins: [
      babelPlugins.syntaxImportAssertions,
      babelPlugins.proposalClassStaticBlock,
    ],
  };
};
