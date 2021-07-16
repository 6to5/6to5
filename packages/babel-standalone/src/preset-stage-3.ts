import * as babelPlugins from "./generated/plugins";

export default () => {
  return {
    plugins: [
      babelPlugins.syntaxImportAssertions,
      babelPlugins.proposalClassStaticBlock,
      babelPlugins.proposalPrivatePropertyInObject,
    ],
  };
};
