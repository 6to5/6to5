// Temporary workaround for https://github.com/facebook/jest/issues/9771
// Source: https://github.com/facebook/jest/issues/9771#issuecomment-841624042

const resolver = require("enhanced-resolve").create.sync({
  conditionNames: ["node", "require", "default"],
  extensions: [".js", ".json", ".node", ".ts"],
});

module.exports = function (request, options) {
  return resolver(options.basedir, request);
};
