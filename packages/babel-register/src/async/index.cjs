"use strict";

/**
 * This file wraps the compiled ES6 module implementation of register so
 * that it can be used both from a standard CommonJS environment, and also
 * from a compiled Babel import.
 */

const { register, revert } = require("./hook.cjs");

exports = module.exports = function (...args) {
  return register(...args);
};
exports.__esModule = true;
exports.default = exports;
exports.revert = revert;

register();
