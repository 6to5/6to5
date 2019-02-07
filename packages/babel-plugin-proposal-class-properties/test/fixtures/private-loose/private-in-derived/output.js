var Outer = function Outer() {
  "use strict";

  var _this = this;

  babelHelpers.classCallCheck(this, Outer);
  Object.defineProperty(_this, _outer, {
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
  }(babelHelpers.classPrivateFieldLooseBase(_this, _outer)[_outer]);
};

var _outer = babelHelpers.classPrivateFieldLooseKey("outer");
