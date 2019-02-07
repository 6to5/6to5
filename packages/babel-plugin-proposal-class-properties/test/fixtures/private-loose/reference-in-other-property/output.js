var Foo = function Foo() {
  "use strict";

  var _this = this;

  babelHelpers.classCallCheck(this, Foo);
  _this.one = babelHelpers.classPrivateFieldLooseBase(_this, _private)[_private];
  Object.defineProperty(_this, _two, {
    writable: true,
    value: babelHelpers.classPrivateFieldLooseBase(_this, _private)[_private]
  });
  Object.defineProperty(_this, _private, {
    writable: true,
    value: 0
  });
  _this.three = babelHelpers.classPrivateFieldLooseBase(_this, _private)[_private];
  Object.defineProperty(_this, _four, {
    writable: true,
    value: babelHelpers.classPrivateFieldLooseBase(_this, _private)[_private]
  });
};

var _two = babelHelpers.classPrivateFieldLooseKey("two");

var _private = babelHelpers.classPrivateFieldLooseKey("private");

var _four = babelHelpers.classPrivateFieldLooseKey("four");
