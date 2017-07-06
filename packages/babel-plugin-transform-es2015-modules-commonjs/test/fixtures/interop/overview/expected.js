"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.test2 = exports.test = undefined;

require("foo");

require("foo-bar");

require("./directory/foo-bar");

var _foo = require("foo2");

var _foo2 = babelHelpers.interopRequireDefault(_foo);

var _foo3 = require("foo3");

var foo2 = babelHelpers.interopRequireWildcard(_foo3);

var _foo4 = require("foo4");

var _foo5 = require("foo5");

exports.test = test;
var test2 = exports.test2 = 5;
_foo4.bar;
_foo5.foo;
_foo2.default;