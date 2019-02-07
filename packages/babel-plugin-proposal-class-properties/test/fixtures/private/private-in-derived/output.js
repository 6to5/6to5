var Outer = function Outer() {
  "use strict";

  var _this = this;

  babelHelpers.classCallCheck(this, Outer);

  _outer.set(_this, {
    writable: true,
    value: void 0
  });

  var Test =
  /*#__PURE__*/
  function (_babelHelpers$classPr) {
    babelHelpers.inherits(Test, _babelHelpers$classPr);

    function Test() {
      babelHelpers.classCallCheck(this, Test);
      return babelHelpers.possibleConstructorReturn(this, babelHelpers.getPrototypeOf(Test).apply(this, arguments));
    }

    return Test;
  }(babelHelpers.classPrivateFieldGet(_this, _outer));
};

var _outer = new WeakMap();
