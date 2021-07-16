import presetStage2 from "./preset-stage-2";
import * as babelPlugins from "./generated/plugins";

export default (_: any, opts: any = {}) => {
  const {
    loose = false,
    useBuiltIns = false,
    decoratorsLegacy = false,
    decoratorsBeforeExport,
    pipelineProposal = "minimal",
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
      babelPlugins.proposalExportDefaultFrom,
      [babelPlugins.proposalPipelineOperator, { proposal: pipelineProposal }],
      babelPlugins.proposalDoExpressions,
    ],
  };
};
