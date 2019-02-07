var B = function B() {
  "use strict";

  babelHelpers.classCallCheck(this, B);
};

var A =
/*#__PURE__*/
function (_B) {
  "use strict";

  babelHelpers.inherits(A, _B);

  function A() {
    var _this;

    babelHelpers.classCallCheck(this, A);
    babelHelpers.assertThisInitialized(_this);
    _this.foo = 1;
    return {
      foo: 'foo'
    } || _this;
  }

  return A;
}(B);

new A();
