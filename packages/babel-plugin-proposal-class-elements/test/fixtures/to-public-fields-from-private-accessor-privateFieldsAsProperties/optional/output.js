var _foo = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("foo");

class Cl {
  constructor() {
    Object.defineProperty(this, _foo, {
      get: _get_foo,
      set: _set_foo
    });
  }

  test() {
    babelHelpers.classPrivateFieldLooseBase(this, _foo)[_foo]?.bar;
    this === null || this === void 0 ? void 0 : babelHelpers.classPrivateFieldLooseBase(this, _foo)[_foo];
    this === null || this === void 0 ? void 0 : babelHelpers.classPrivateFieldLooseBase(this.self, _foo)[_foo];
  }

}

function _get_foo() {}

function _set_foo(x) {}
