import presetStage3 from "babel-preset-stage-3";

import transformClassProperties from "babel-plugin-transform-class-properties";

export default function() {
  return {
    presets: [presetStage3],
    plugins: [transformClassProperties],
  };
}
