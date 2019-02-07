var Foo =
/*#__PURE__*/
function (_Bar) {
  "use strict";

  babelHelpers.inherits(Foo, _Bar);

  function Foo() {
    var _this;

    babelHelpers.classCallCheck(this, Foo);
    _this = babelHelpers.possibleConstructorReturn(this, babelHelpers.getPrototypeOf(Foo).call(this));

    _bar.set(_this, {
      writable: true,
      value: "foo"
    });

    return _this;
  }

  return Foo;
}(Bar);

var _bar = new WeakMap();
