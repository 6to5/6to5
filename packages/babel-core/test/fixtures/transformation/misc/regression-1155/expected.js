var Foo = (0,
/*#__PURE__*/
function (_Bar) {
  babelHelpers.inherits(Foo, _Bar);

  function Foo(options) {
    babelHelpers.classCallCheck(this, Foo);
    var parentOptions = {};

    parentOptions.init = function () {
      this;
    };

    return babelHelpers.possibleConstructorReturn(this, (Foo.__proto__ || Object.getPrototypeOf(Foo)).call(this, parentOptions));
  }

  return Foo;
}(Bar));
