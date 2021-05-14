var _priv = /*#__PURE__*/new WeakMap(),
    _priv2 = /*#__PURE__*/new WeakMap();

class A {
  constructor() {
    babelHelpers.defineProperty(this, "pub1", 1);

    _priv.set(this, 2);

    _priv2.set(this, 3);

    babelHelpers.defineProperty(this, "pub2", 4);
  }

}
