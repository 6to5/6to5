/**
 * This file wraps the compiled ES6 module implementation of register so
 * that it can be used both from a standard CommonJS environment, and also
 * from a compiled Babel import.
 */

exports = module.exports = function (...args) {
  return register(...args);
};
exports.__esModule = true;

const node = require("./nodeWrapper");
const register = node.default;

Object.assign(exports, node);
