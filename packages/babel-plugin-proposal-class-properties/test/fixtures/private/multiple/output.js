var Foo = function Foo() {
  "use strict";

  var _this = this;

  babelHelpers.classCallCheck(this, Foo);

  _x.set(_this, {
    writable: true,
    value: 0
  });

  _y.set(_this, {
    writable: true,
    value: babelHelpers.classPrivateFieldGet(_this, _x)
  });
};

var _x = new WeakMap();

var _y = new WeakMap();
