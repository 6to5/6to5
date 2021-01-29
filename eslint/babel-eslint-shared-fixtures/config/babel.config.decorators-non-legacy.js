// TODO(Babel 8): Remove this file, it will be unused

"use strict";

module.exports = {
  presets: [["@babel/preset-env", { forceAllTransforms: true }]],
  plugins: [
    ["@babel/plugin-proposal-decorators", { decoratorsBeforeExport: false }],
  ],
};
