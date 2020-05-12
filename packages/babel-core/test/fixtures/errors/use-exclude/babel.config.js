module.exports = function myConfig(api) {
  api.cache.never();
  return { exclude: /node_modules/ }
};
