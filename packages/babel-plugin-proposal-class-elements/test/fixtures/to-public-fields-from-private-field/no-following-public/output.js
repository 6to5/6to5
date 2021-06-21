var _priv = /*#__PURE__*/new WeakMap(),
    _foo = /*#__PURE__*/new WeakMap(),
    _bar = /*#__PURE__*/new WeakMap();

class A {
  constructor() {
    _foo.set(this, void 0);

    _bar.set(this, 1);
  }

  pub = 3;
  pub2 = (_priv.set(this, 0), 2);
}
