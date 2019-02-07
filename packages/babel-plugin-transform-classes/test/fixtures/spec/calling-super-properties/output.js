var Test =
/*#__PURE__*/
function (_Foo) {
  "use strict";

  babelHelpers.inherits(Test, _Foo);

  function Test() {
    var _this;

    babelHelpers.classCallCheck(this, Test);
    _this = babelHelpers.possibleConstructorReturn(this, babelHelpers.getPrototypeOf(Test).call(this));
    babelHelpers.get(babelHelpers.getPrototypeOf(Test.prototype), "test", _this).whatever();
    babelHelpers.get(babelHelpers.getPrototypeOf(Test.prototype), "test", _this).call(_this);
    return _this;
  }

  babelHelpers.createClass(Test, null, [{
    key: "test",
    value: function test() {
      return babelHelpers.get(babelHelpers.getPrototypeOf(Test), "wow", this).call(this);
    }
  }]);
  return Test;
}(Foo);
