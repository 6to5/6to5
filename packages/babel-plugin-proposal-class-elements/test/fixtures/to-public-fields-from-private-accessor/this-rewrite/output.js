var _foo = /*#__PURE__*/new WeakSet();

class A {
  constructor() {
    _foo.add(this);
  }

}

function _get_foo() {
  this;

  () => this;

  (function () {
    this;
  }).call(this);
  babelHelpers.classPrivateAccessorGet2(this, _foo, _get_foo);
  babelHelpers.classPrivateAccessorSet2(this, _foo, _set_foo, 2);
}

function _set_foo(x) {}
