import presetStage2 from "./preset-stage-2";
import * as babelPlugins from "./generated/plugins";

export default (_: any, opts: any = {}) => {
  const {
    loose = false,
    useBuiltIns = false,
    decoratorsLegacy = false,
    decoratorsBeforeExport,
    pipelineProposal = "minimal",
    recordAndTupleSyntax: recordAndTupleSyntax = "hash",
  } = opts;

  return {
    presets: [
      [
        presetStage2,
        { loose, useBuiltIns, decoratorsLegacy, decoratorsBeforeExport },
      ],
    ],
    plugins: [
      babelPlugins.syntaxDecimal,
      [babelPlugins.syntaxRecordAndTuple, { syntaxType: recordAndTupleSyntax }],
      babelPlugins.syntaxModuleBlocks,
      babelPlugins.proposalExportDefaultFrom,
      [
        babelPlugins.proposalPipelineOperator,
        { proposal: pipelineProposal, topicToken: "%" },
      ],
      babelPlugins.proposalDoExpressions,
    ],
  };
};
