var Foo =
/*#__PURE__*/
function (_Bar) {
  "use strict";

  babelHelpers.inherits(Foo, _Bar);

  function Foo() {
    var _this;

    babelHelpers.classCallCheck(this, Foo);

    var fn = () => babelHelpers.assertThisInitialized(_this);

    _this = babelHelpers.possibleConstructorReturn(this, babelHelpers.getPrototypeOf(Foo).call(this));
    fn();
    return _this;
  }

  return Foo;
}(Bar); // 'assertThisInitialized` should be cleanup


var A =
/*#__PURE__*/
function (_Bar2) {
  "use strict";

  babelHelpers.inherits(A, _Bar2);

  function A() {
    var _this2;

    babelHelpers.classCallCheck(this, A);
    _this2 = babelHelpers.possibleConstructorReturn(this, babelHelpers.getPrototypeOf(A).call(this));

    var fn = () => _this2;

    _this2;
    fn();
    return _this2;
  }

  return A;
}(Bar);
