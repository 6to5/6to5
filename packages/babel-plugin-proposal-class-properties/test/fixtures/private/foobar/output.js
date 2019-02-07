var Child =
/*#__PURE__*/
function (_Parent) {
  "use strict";

  babelHelpers.inherits(Child, _Parent);

  function Child() {
    var _this;

    babelHelpers.classCallCheck(this, Child);
    _this = babelHelpers.possibleConstructorReturn(this, babelHelpers.getPrototypeOf(Child).call(this));

    _scopedFunctionWithThis.set(_this, {
      writable: true,
      value: () => {
        _this.name = {};
      }
    });

    return _this;
  }

  return Child;
}(Parent);

var _scopedFunctionWithThis = new WeakMap();
