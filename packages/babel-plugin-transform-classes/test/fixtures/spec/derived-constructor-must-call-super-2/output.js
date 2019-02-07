var Foo =
/*#__PURE__*/
function (_Bar) {
  "use strict";

  babelHelpers.inherits(Foo, _Bar);

  function Foo() {
    var _this;

    babelHelpers.classCallCheck(this, Foo);
    if (eval("false")) _this = babelHelpers.possibleConstructorReturn(this, babelHelpers.getPrototypeOf(Foo).call(this));
    return babelHelpers.possibleConstructorReturn(_this);
  }

  return Foo;
}(Bar);

var Baz =
/*#__PURE__*/
function (_Bar2) {
  "use strict";

  babelHelpers.inherits(Baz, _Bar2);

  function Baz() {
    var _this2;

    babelHelpers.classCallCheck(this, Baz);
    false && babelHelpers.assertThisInitialized(_this2);
    babelHelpers.assertThisInitialized(_this2);
    return _this2;
  }

  return Baz;
}(Bar);
