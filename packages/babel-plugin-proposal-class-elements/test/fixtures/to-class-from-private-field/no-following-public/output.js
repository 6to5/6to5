var _priv = /*#__PURE__*/new WeakMap(),
    _foo = /*#__PURE__*/new WeakMap(),
    _bar = /*#__PURE__*/new WeakMap();

class A {
  constructor() {
    babelHelpers.defineProperty(this, "pub", 3);

    _priv.set(this, 0);

    babelHelpers.defineProperty(this, "pub2", 2);

    _foo.set(this, void 0);

    _bar.set(this, 1);
  }

}
