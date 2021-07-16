"use strict";

module.exports = {
  presets: [
    ["@babel/preset-env", { forceAllTransforms: true }],
    ["@babel/preset-flow", { all: true }],
    "@babel/preset-react",
  ],
  plugins: [
    "@babel/plugin-syntax-export-default-from",
    "@babel/plugin-proposal-class-properties",
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-pipeline-operator", { proposal: "minimal" }],
    "@babel/plugin-proposal-private-methods",
    "@babel/plugin-proposal-do-expressions",
  ],
};
