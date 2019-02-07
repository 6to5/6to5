var Foo =
/*#__PURE__*/
function (_Bar) {
  "use strict";

  babelHelpers.inherits(Foo, _Bar);

  function Foo() {
    var _this;

    babelHelpers.classCallCheck(this, Foo);

    var t = () => babelHelpers.get(babelHelpers.getPrototypeOf(Foo.prototype), "test", babelHelpers.assertThisInitialized(_this)).call(_this);

    babelHelpers.get(babelHelpers.getPrototypeOf(Foo.prototype), "foo", babelHelpers.assertThisInitialized(_this)).call(_this);
    return _this = babelHelpers.possibleConstructorReturn(this, babelHelpers.getPrototypeOf(Foo).call(this));
  }

  return Foo;
}(Bar);
