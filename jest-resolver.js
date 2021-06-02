// Workaound for https://github.com/facebook/jest/issues/9771

module.exports = (request, options) => {
  let resolved = options.defaultResolver(request, options);
  if (
    [
      "babel-plugin-polyfill-corejs2",
      "babel-plugin-polyfill-corejs3",
      "babel-plugin-polyfill-regenerator",
      "babel-plugin-polyfill-es-shims",
    ].some(name => request.includes(name))
  ) {
    resolved = resolved.replace(
      /(babel-plugin-polyfill-[\w-]+[\\\/])lib([\\\/])index\.js$/,
      "$1esm$2index.mjs"
    );
  } else if (request.includes("@babel/helper-define-polyfill-provider")) {
    resolved = resolved.replace(
      /(helper-define-polyfill-provider[\\\/])lib([\\\/])index\.js$/,
      "$1esm$2index.node.mjs"
    );
  }
  return resolved;
};
