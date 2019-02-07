var A =
/*#__PURE__*/
function () {
  "use strict";

  function A() {
    babelHelpers.classCallCheck(this, A);
  }

  babelHelpers.createClass(A, [{
    key: "foo",
    value: function foo() {
      return "bar";
    }
  }]);
  return A;
}();

var B =
/*#__PURE__*/
function (_A) {
  "use strict";

  babelHelpers.inherits(B, _A);

  function B(...args) {
    var _this;

    babelHelpers.classCallCheck(this, B);
    _this = babelHelpers.possibleConstructorReturn(this, babelHelpers.getPrototypeOf(B).call(this, ...args));

    _foo.set(_this, {
      writable: true,
      value: babelHelpers.get(babelHelpers.getPrototypeOf(B.prototype), "foo", _this).call(_this)
    });

    return _this;
  }

  return B;
}(A);

var _foo = new WeakMap();
