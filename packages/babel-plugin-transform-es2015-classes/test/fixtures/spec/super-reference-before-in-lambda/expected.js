var Foo = function (_Bar) {
  babelHelpers.inherits(Foo, _Bar);

  function Foo() {
    var _this;

    babelHelpers.classCallCheck(this, Foo);

    var t = () => babelHelpers.get(Foo.prototype.__proto__ || Object.getPrototypeOf(Foo.prototype), "test", _this).call(_this);

    return _this = babelHelpers.possibleConstructorReturn(this, (Foo.__proto__ || Object.getPrototypeOf(Foo)).call(this));
  }

  return Foo;
}(Bar);