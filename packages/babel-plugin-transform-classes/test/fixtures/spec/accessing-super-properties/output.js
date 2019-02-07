var Test =
/*#__PURE__*/
function (_Foo) {
  "use strict";

  babelHelpers.inherits(Test, _Foo);

  function Test() {
    var _this;

    babelHelpers.classCallCheck(this, Test);
    _this = babelHelpers.possibleConstructorReturn(this, babelHelpers.getPrototypeOf(Test).call(this));
    babelHelpers.get(babelHelpers.getPrototypeOf(Test.prototype), "test", _this);
    babelHelpers.get(babelHelpers.getPrototypeOf(Test.prototype), "test", _this).whatever;
    return _this;
  }

  return Test;
}(Foo);
