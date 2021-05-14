var _foo = /*#__PURE__*/new WeakSet();

class Cl {
  constructor() {
    _foo.add(this);
  }

  test() {
    babelHelpers.classPrivateAccessorGet2(this, _foo, _get_foo)?.bar;
    this === null || this === void 0 ? void 0 : babelHelpers.classPrivateAccessorGet2(this, _foo, _get_foo);
    this === null || this === void 0 ? void 0 : babelHelpers.classPrivateAccessorGet2(this.self, _foo, _get_foo);
  }

}

function _get_foo() {}

function _set_foo(x) {}
