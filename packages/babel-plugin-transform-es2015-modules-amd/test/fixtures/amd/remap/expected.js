define(["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var test = exports.test = 2;
  exports.test = test = 5;
  exports.test = test += 1;

  (function () {
    var test = 2;
    test = 3;
    test++;
  })();

  var a = 2;
  exports.a = a;
  exports.a = a = 3;
  var b = 2;
  exports.c = b;
  exports.c = b = 3;
  var d = 3;
  exports.e = d;
  exports.f = d;
  exports.f = exports.e = d = 4;
});