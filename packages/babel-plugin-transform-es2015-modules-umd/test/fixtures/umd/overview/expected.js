(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "foo", "foo-bar", "./directory/foo-bar"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("foo"), require("foo-bar"), require("./directory/foo-bar"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.foo, global.fooBar, global.fooBar);
    global.actual = mod.exports;
  }
})(this, function (exports, _foo) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.test2 = exports.test = undefined;
  var foo2 = babelHelpers.interopRequireWildcard(_foo);
  exports.test = test;
  var test2 = exports.test2 = 5;
  exports.default = test;
  _foo.bar;
  _foo.foo;
});