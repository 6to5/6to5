import presetStage1 from "babel-preset-stage-1";

import transformDoExpressions from "babel-plugin-transform-do-expressions";
import transformFunctionBind from "babel-plugin-transform-function-bind";

export default function() {
  return {
    presets: [presetStage1],
    plugins: [transformDoExpressions, transformFunctionBind],
  };
}
