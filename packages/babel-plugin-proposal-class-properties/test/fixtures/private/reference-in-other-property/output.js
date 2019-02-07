var Foo = function Foo() {
  "use strict";

  var _this = this;

  babelHelpers.classCallCheck(this, Foo);
  babelHelpers.defineProperty(_this, "one", babelHelpers.classPrivateFieldGet(_this, _private));

  _two.set(_this, {
    writable: true,
    value: babelHelpers.classPrivateFieldGet(_this, _private)
  });

  _private.set(_this, {
    writable: true,
    value: 0
  });

  babelHelpers.defineProperty(_this, "three", babelHelpers.classPrivateFieldGet(_this, _private));

  _four.set(_this, {
    writable: true,
    value: babelHelpers.classPrivateFieldGet(_this, _private)
  });
};

var _two = new WeakMap();

var _private = new WeakMap();

var _four = new WeakMap();
