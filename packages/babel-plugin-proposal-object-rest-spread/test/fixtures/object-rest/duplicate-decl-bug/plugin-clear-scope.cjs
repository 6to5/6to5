"use strict";
exports.__esModule = true;
exports.default = function (api) {
  return {
    visitor: {
      Program: function () {
        api.traverse.cache.clearScope();
      }
    }
  };
};
