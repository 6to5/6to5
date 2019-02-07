var C = function C() {
  "use strict";

  var _this = this;

  babelHelpers.classCallCheck(this, C);
  babelHelpers.defineProperty(_this, "y", babelHelpers.classPrivateFieldGet(_this, _x));

  _x.set(_this, {
    writable: true,
    value: void 0
  });
};

var _x = new WeakMap();

expect(() => {
  new C();
}).toThrow();
