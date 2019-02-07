var foo = "bar";

var Foo = function Foo(_foo) {
  "use strict";

  var _this = this;

  babelHelpers.classCallCheck(this, Foo);
  babelHelpers.defineProperty(_this, "bar", _this);
  babelHelpers.defineProperty(_this, "baz", foo);
};
