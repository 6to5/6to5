var _foo = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("foo");

class A {
  constructor() {
    Object.defineProperty(this, _foo, {
      get: _get_foo,
      set: _set_foo
    });
  }

}

function _get_foo() {
  this;

  () => this;

  (function () {
    this;
  }).call(this);
  babelHelpers.classPrivateFieldLooseBase(this, _foo)[_foo];
  babelHelpers.classPrivateFieldLooseBase(this, _foo)[_foo] = 2;
}

function _set_foo(x) {}
