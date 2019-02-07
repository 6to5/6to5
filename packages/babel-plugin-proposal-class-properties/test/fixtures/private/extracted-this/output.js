var foo = "bar";

var Foo = function Foo(_foo) {
  "use strict";

  var _this = this;

  babelHelpers.classCallCheck(this, Foo);

  _bar.set(_this, {
    writable: true,
    value: _this
  });

  _baz.set(_this, {
    writable: true,
    value: foo
  });
};

var _bar = new WeakMap();

var _baz = new WeakMap();
