var Test =
/*#__PURE__*/
function (_Foo) {
  "use strict";

  babelHelpers.inherits(Test, _Foo);

  function Test() {
    var _babelHelpers$getProt, _babelHelpers$get;

    var _this;

    babelHelpers.classCallCheck(this, Test);
    woops.super.test();
    _this = babelHelpers.possibleConstructorReturn(this, babelHelpers.getPrototypeOf(Test).call(this));
    babelHelpers.get(babelHelpers.getPrototypeOf(Test.prototype), "test", _this).call(_this);
    _this = babelHelpers.possibleConstructorReturn(this, babelHelpers.getPrototypeOf(Test).apply(this, arguments));
    _this = babelHelpers.possibleConstructorReturn(this, (_babelHelpers$getProt = babelHelpers.getPrototypeOf(Test)).call.apply(_babelHelpers$getProt, [this, "test"].concat(Array.prototype.slice.call(arguments))));
    babelHelpers.get(babelHelpers.getPrototypeOf(Test.prototype), "test", _this).apply(_this, arguments);

    (_babelHelpers$get = babelHelpers.get(babelHelpers.getPrototypeOf(Test.prototype), "test", _this)).call.apply(_babelHelpers$get, [_this, "test"].concat(Array.prototype.slice.call(arguments)));

    return _this;
  }

  babelHelpers.createClass(Test, [{
    key: "test",
    value: function test() {
      var _babelHelpers$get2;

      babelHelpers.get(babelHelpers.getPrototypeOf(Test.prototype), "test", this).call(this);
      babelHelpers.get(babelHelpers.getPrototypeOf(Test.prototype), "test", this).apply(this, arguments);

      (_babelHelpers$get2 = babelHelpers.get(babelHelpers.getPrototypeOf(Test.prototype), "test", this)).call.apply(_babelHelpers$get2, [this, "test"].concat(Array.prototype.slice.call(arguments)));
    }
  }], [{
    key: "foo",
    value: function foo() {
      var _babelHelpers$get3;

      babelHelpers.get(babelHelpers.getPrototypeOf(Test), "foo", this).call(this);
      babelHelpers.get(babelHelpers.getPrototypeOf(Test), "foo", this).apply(this, arguments);

      (_babelHelpers$get3 = babelHelpers.get(babelHelpers.getPrototypeOf(Test), "foo", this)).call.apply(_babelHelpers$get3, [this, "test"].concat(Array.prototype.slice.call(arguments)));
    }
  }]);
  return Test;
}(Foo);
