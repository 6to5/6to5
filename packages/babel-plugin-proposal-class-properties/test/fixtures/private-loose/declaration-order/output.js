var C = function C() {
  "use strict";

  var _this = this;

  babelHelpers.classCallCheck(this, C);
  _this.y = babelHelpers.classPrivateFieldLooseBase(_this, _x)[_x];
  Object.defineProperty(_this, _x, {
    writable: true,
    value: void 0
  });
};

var _x = babelHelpers.classPrivateFieldLooseKey("x");

expect(() => {
  new C();
}).toThrow();
