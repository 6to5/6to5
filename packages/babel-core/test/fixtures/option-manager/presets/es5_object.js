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
