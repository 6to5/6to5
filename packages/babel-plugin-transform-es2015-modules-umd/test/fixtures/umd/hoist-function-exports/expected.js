(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./evens"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./evens"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.evens);
    global.actual = mod.exports;
  }
})(this, function (exports, _evens) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.isOdd = undefined;
  exports.nextOdd = nextOdd;

  function nextOdd(n) {
    return (0, _evens.isEven)(n) ? n + 1 : n + 2;
  }

  var isOdd = exports.isOdd = function (isEven) {
    return function (n) {
      return !isEven(n);
    };
  }(_evens.isEven);
});