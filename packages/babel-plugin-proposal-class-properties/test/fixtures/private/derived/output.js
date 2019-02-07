var Foo = function Foo() {
  "use strict";

  babelHelpers.classCallCheck(this, Foo);

  _prop.set(this, {
    writable: true,
    value: "foo"
  });
};

var _prop = new WeakMap();

var Bar =
/*#__PURE__*/
function (_Foo) {
  "use strict";

  babelHelpers.inherits(Bar, _Foo);

  function Bar(...args) {
    var _this;

    babelHelpers.classCallCheck(this, Bar);
    _this = babelHelpers.possibleConstructorReturn(this, babelHelpers.getPrototypeOf(Bar).call(this, ...args));

    _prop2.set(_this, {
      writable: true,
      value: "bar"
    });

    return _this;
  }

  return Bar;
}(Foo);

var _prop2 = new WeakMap();
