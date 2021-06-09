// from code:
// export default {
//   plugins: [
//     require('../../../../../babel-plugin-syntax-decorators'),
//   ]
// };
"use strict";

exports.__esModule = true;
module.exports = function () {
  return {
    plugins: [
      function () {
        return {
          manipulateOptions(opts, parserOpts) {
            parserOpts.plugins.push("decorators-legacy");
          },
        };
      },
    ],
  };
};
