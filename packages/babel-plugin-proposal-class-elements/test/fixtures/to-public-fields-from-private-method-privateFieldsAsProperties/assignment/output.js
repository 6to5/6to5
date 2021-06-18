var _foo = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("foo"),
    _bar = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("bar");

class Foo {
  constructor() {
    Object.defineProperty(this, _foo, {
      value: _foo2
    });
    Object.defineProperty(this, _bar, {
      value: _bar2
    });
    babelHelpers.classPrivateFieldLooseBase(get(), _foo)[_foo] = 2;
    babelHelpers.classPrivateFieldLooseBase(this, _bar)[_bar]++;

    var _foo3 = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("foo");

    class X {
      constructor() {
        Object.defineProperty(this, _foo3, {
          writable: true,
          value: void 0
        });
        babelHelpers.classPrivateFieldLooseBase(this, _foo3)[_foo3] = 2;
        babelHelpers.classPrivateFieldLooseBase(this, _bar)[_bar] += run();
      }

    }
  }

}

function _foo2() {
  return 42;
}

function _bar2() {
  return 42;
}
