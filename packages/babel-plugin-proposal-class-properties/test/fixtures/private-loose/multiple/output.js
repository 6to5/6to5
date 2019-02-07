var Foo = function Foo() {
  "use strict";

  var _this = this;

  babelHelpers.classCallCheck(this, Foo);
  Object.defineProperty(_this, _x, {
    writable: true,
    value: 0
  });
  Object.defineProperty(_this, _y, {
    writable: true,
    value: babelHelpers.classPrivateFieldLooseBase(_this, _x)[_x]
  });
};

var _x = babelHelpers.classPrivateFieldLooseKey("x");

var _y = babelHelpers.classPrivateFieldLooseKey("y");
