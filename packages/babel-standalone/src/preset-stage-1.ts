import presetStage2 from "./preset-stage-2";
import * as babelPlugins from "./generated/plugins";

export default (_: any, opts: any = {}) => {
  const {
    loose = false,
    useBuiltIns = false,
    decoratorsLegacy = false,
    pipelineProposal = "minimal",
    recordAndTupleSyntax: recordAndTupleSyntax = "hash",
  } = opts;

  if (!process.env.BABEL_8_BREAKING) {
    // eslint-disable-next-line no-var
    var { decoratorsBeforeExport } = opts;
  }

  return {
    presets: [
      [
        presetStage2,
        process.env.BABEL_8_BREAKING
          ? { loose, useBuiltIns, decoratorsLegacy }
          : { loose, useBuiltIns, decoratorsLegacy, decoratorsBeforeExport },
      ],
    ],
    plugins: [
      babelPlugins.syntaxDecimal,
      [babelPlugins.syntaxRecordAndTuple, { syntaxType: recordAndTupleSyntax }],
      babelPlugins.syntaxModuleBlocks,
      babelPlugins.proposalExportDefaultFrom,
      [babelPlugins.proposalPipelineOperator, { proposal: pipelineProposal }],
      babelPlugins.proposalDoExpressions,
    ],
  };
};
