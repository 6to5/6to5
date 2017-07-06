var Test = function (_Foo) {
  babelHelpers.inherits(Test, _Foo);

  function Test() {
    var _ref, _babelHelpers$get;

    babelHelpers.classCallCheck(this, Test);
    woops.super.test();

    var _this = babelHelpers.possibleConstructorReturn(this, (Test.__proto__ || Object.getPrototypeOf(Test)).call(this));

    babelHelpers.get(Test.prototype.__proto__ || Object.getPrototypeOf(Test.prototype), "test", _this).call(_this);

    var _this = babelHelpers.possibleConstructorReturn(this, (Test.__proto__ || Object.getPrototypeOf(Test)).apply(this, arguments));

    var _this = babelHelpers.possibleConstructorReturn(this, (_ref = Test.__proto__ || Object.getPrototypeOf(Test)).call.apply(_ref, [this, "test"].concat(Array.prototype.slice.call(arguments))));

    babelHelpers.get(Test.prototype.__proto__ || Object.getPrototypeOf(Test.prototype), "test", _this).apply(_this, arguments);

    (_babelHelpers$get = babelHelpers.get(Test.prototype.__proto__ || Object.getPrototypeOf(Test.prototype), "test", _this)).call.apply(_babelHelpers$get, [_this, "test"].concat(Array.prototype.slice.call(arguments)));

    return _this;
  }

  babelHelpers.createClass(Test, [{
    key: "test",
    value: function test() {
      var _babelHelpers$get2;

      babelHelpers.get(Test.prototype.__proto__ || Object.getPrototypeOf(Test.prototype), "test", this).call(this);
      babelHelpers.get(Test.prototype.__proto__ || Object.getPrototypeOf(Test.prototype), "test", this).apply(this, arguments);

      (_babelHelpers$get2 = babelHelpers.get(Test.prototype.__proto__ || Object.getPrototypeOf(Test.prototype), "test", this)).call.apply(_babelHelpers$get2, [this, "test"].concat(Array.prototype.slice.call(arguments)));
    }
  }], [{
    key: "foo",
    value: function foo() {
      var _babelHelpers$get3;

      babelHelpers.get(Test.__proto__ || Object.getPrototypeOf(Test), "foo", this).call(this);
      babelHelpers.get(Test.__proto__ || Object.getPrototypeOf(Test), "foo", this).apply(this, arguments);

      (_babelHelpers$get3 = babelHelpers.get(Test.__proto__ || Object.getPrototypeOf(Test), "foo", this)).call.apply(_babelHelpers$get3, [this, "test"].concat(Array.prototype.slice.call(arguments)));
    }
  }]);
  return Test;
}(Foo);