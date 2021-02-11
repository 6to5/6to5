import presetStage3 from "./preset-stage-3";
import * as babelPlugins from "./generated/plugins";

export default (_: any, opts: any = {}) => {
  const { loose = false, useBuiltIns = false, decoratorsLegacy = false } = opts;

  if (!process.env.BABEL_8_BREAKING) {
    // eslint-disable-next-line no-var
    var { decoratorsBeforeExport } = opts;
  }

  return {
    presets: [[presetStage3, { loose, useBuiltIns }]],
    plugins: [
      babelPlugins.proposalClassStaticBlock,
      [
        babelPlugins.proposalDecorators,
        process.env.BABEL_8_BREAKING
          ? { legacy: decoratorsLegacy }
          : { legacy: decoratorsLegacy, decoratorsBeforeExport },
      ],
      babelPlugins.proposalFunctionSent,
      babelPlugins.proposalPrivatePropertyInObject,
      babelPlugins.proposalThrowExpressions,
    ],
  };
};
