var foo = "bar";

var _bar = /*#__PURE__*/new WeakMap();

var Foo = function Foo() {
  "use strict";

  babelHelpers.classCallCheck(this, Foo);

  _bar.set(this, {
    writable: true,
    value: foo
  });

  var _foo = "foo";
};
