(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.actual = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.foo8 = foo8;
  var foo = exports.foo = 1;
  var foo2 = exports.foo2 = 1,
      bar = exports.bar = 2;

  var foo3 = exports.foo3 = function () {};

  var foo4 = exports.foo4 = undefined;
  let foo5 = exports.foo5 = 2;
  let foo6 = exports.foo6 = undefined;
  const foo7 = exports.foo7 = 3;

  function foo8() {}

  class foo9 {}

  exports.foo9 = foo9;
});