// @flow
import presetStage2 from "./preset-stage-2";
import * as babelPlugins from "./generated/plugins";

export default (_: any, opts: Object = {}) => {
  const {
    loose = false,
    useBuiltIns = false,
    decoratorsLegacy = false,
    decoratorsBeforeExport,
    pipelineProposal = "minimal",
    eventualSendTargetGlobal = "HandledPromise",
    recordAndTupleSyntax: recordAndTupleSyntax = "hash",
    moduleAttributesVersion = "may-2020",
  } = opts;

  return {
    presets: [
      [
        presetStage2,
        { loose, useBuiltIns, decoratorsLegacy, decoratorsBeforeExport },
      ],
    ],
    plugins: [
      [
        babelPlugins.syntaxModuleAttributes,
        { version: moduleAttributesVersion },
      ],
      [babelPlugins.syntaxRecordAndTuple, { syntaxType: recordAndTupleSyntax }],
      babelPlugins.proposalExportDefaultFrom,
      [babelPlugins.proposalPipelineOperator, { proposal: pipelineProposal }],
      babelPlugins.proposalPrivatePropertyInObject,
      [
        babelPlugins.proposalEventualSend,
        { targetGlobal: eventualSendTargetGlobal },
      ],
      babelPlugins.proposalDoExpressions,
    ],
  };
};
