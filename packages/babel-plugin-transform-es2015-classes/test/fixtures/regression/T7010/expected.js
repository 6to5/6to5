"use strict";

var Foo = function () {
  function Foo(val) {
    babelHelpers.classCallCheck(this, Foo);
    this._val = val;
  }

  babelHelpers.createClass(Foo, [{
    key: "foo2",
    value: function (_foo) {
      function foo2() {
        return _foo.apply(this, arguments);
      }

      foo2.toString = function () {
        return _foo.toString();
      };

      return foo2;
    }(function () {
      return foo2(this._val);
    })
  }]);
  return Foo;
}();