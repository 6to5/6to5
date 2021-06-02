// from code:
// export const plugins = [
//   require('../../../../../babel-plugin-syntax-decorators'),
// ];
"use strict";

exports.__esModule = true;
var plugins = (exports.plugins = [
  function () {
    return {
      manipulateOptions(opts, parserOpts) {
        parserOpts.plugins.push("decorators-legacy");
      },
    };
  },
]);
