var _foo = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("foo"),
    _bar = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("bar"),
    _baz = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("baz");

class A {
  constructor() {
    Object.defineProperty(this, _foo, {
      get: _get_foo,
      set: _set_foo
    });
    Object.defineProperty(this, _bar, {
      get: _get_bar,
      set: _set_bar
    });
    Object.defineProperty(this, _baz, {
      writable: true,
      value: void 0
    });
  }

  test() {
    var _foo2 = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("foo"),
        _baz2 = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("baz");

    class B {
      constructor() {
        Object.defineProperty(this, _baz2, {
          get: _get_baz,
          set: _set_baz
        });
        Object.defineProperty(this, _foo2, {
          writable: true,
          value: void 0
        });
      }

      [babelHelpers.classPrivateFieldLooseBase(this, _foo2)[_foo2]]() {
        babelHelpers.classPrivateFieldLooseBase(this, _foo2)[_foo2] = 1;
        babelHelpers.classPrivateFieldLooseBase(this, _bar)[_bar] = 2;
        babelHelpers.classPrivateFieldLooseBase(this, _baz2)[_baz2] = 1.2;
      }

      [babelHelpers.classPrivateFieldLooseBase(this, _bar)[_bar]]() {
        babelHelpers.classPrivateFieldLooseBase(this, _foo2)[_foo2] = 3;
        babelHelpers.classPrivateFieldLooseBase(this, _bar)[_bar] = 4;
        babelHelpers.classPrivateFieldLooseBase(this, _baz2)[_baz2] = 3.4;
      }

      [babelHelpers.classPrivateFieldLooseBase(this, _baz2)[_baz2]]() {
        babelHelpers.classPrivateFieldLooseBase(this, _foo2)[_foo2] = 5;
        babelHelpers.classPrivateFieldLooseBase(this, _bar)[_bar] = 6;
        babelHelpers.classPrivateFieldLooseBase(this, _baz2)[_baz2] = 5.6;
      }

    }

    function _get_baz() {}

    function _set_baz(x) {}
  }

}

function _get_foo() {}

function _set_foo(x) {}

function _get_bar() {}

function _set_bar(x) {}
