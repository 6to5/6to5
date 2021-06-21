var _foo = /*#__PURE__*/new WeakSet(),
    _bar = /*#__PURE__*/new WeakSet();

class Foo {
  constructor() {
    var _this$bar;

    _foo.add(this);

    _bar.add(this);

    get(), 2, babelHelpers.readOnlyError("#foo");
    (this, (_this$bar = +babelHelpers.classPrivateMethodGet(this, _bar, _bar2)) + 1, babelHelpers.readOnlyError("#bar")), _this$bar;

    var _foo3 = /*#__PURE__*/new WeakMap();

    class X {
      constructor() {
        _foo3.set(this, void 0);

        babelHelpers.classPrivateFieldSet2(this, _foo3, 2);
        this, babelHelpers.classPrivateMethodGet(this, _bar, _bar2) + run(), babelHelpers.readOnlyError("#bar");
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
