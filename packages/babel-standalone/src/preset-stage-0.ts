import presetStage1 from "./preset-stage-1";
import { proposalFunctionBind } from "./generated/plugins";

export default (_: any, opts: any = {}) => {
  const {
    loose = false,
    useBuiltIns = false,
    decoratorsLegacy = false,
    pipelineProposal = "minimal",
    importAssertionsVersion = "september-2020",
  } = opts;

  if (!process.env.BABEL_8_BREAKING) {
    // eslint-disable-next-line no-var
    var { decoratorsBeforeExport } = opts;
  }

  return {
    presets: [
      [
        presetStage1,
        process.env.BABEL_8_BREAKING
          ? {
              loose,
              useBuiltIns,
              decoratorsLegacy,
              pipelineProposal,
              importAssertionsVersion,
            }
          : {
              loose,
              useBuiltIns,
              decoratorsLegacy,
              decoratorsBeforeExport,
              pipelineProposal,
              importAssertionsVersion,
            },
      ],
    ],
    plugins: [proposalFunctionBind],
  };
};
