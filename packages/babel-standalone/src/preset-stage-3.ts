import * as babelPlugins from "./generated/plugins";

export default (_: any, opts: any) => {
  let loose = false;

  if (opts !== undefined) {
    if (opts.loose !== undefined) loose = opts.loose;
  }

  return {
    plugins: [
      babelPlugins.syntaxImportAssertions,
      babelPlugins.syntaxImportMeta,
      babelPlugins.syntaxTopLevelAwait,
      babelPlugins.proposalExportNamespaceFrom,
      babelPlugins.proposalLogicalAssignmentOperators,
      [babelPlugins.proposalOptionalChaining, { loose }],
      [babelPlugins.proposalNullishCoalescingOperator, { loose }],
      [babelPlugins.proposalClassProperties, { loose }],
      babelPlugins.proposalJsonStrings,
      babelPlugins.proposalNumericSeparator,
      [babelPlugins.proposalPrivateMethods, { loose }],
      babelPlugins.proposalClassStaticBlock,
    ],
  };
};
