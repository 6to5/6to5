var foo = "bar";

var Foo = function Foo(_foo) {
  "use strict";

  var _this = this;

  babelHelpers.classCallCheck(this, Foo);
  Object.defineProperty(_this, _bar, {
    writable: true,
    value: _this
  });
  Object.defineProperty(_this, _baz, {
    writable: true,
    value: foo
  });
};

var _bar = babelHelpers.classPrivateFieldLooseKey("bar");

var _baz = babelHelpers.classPrivateFieldLooseKey("baz");
