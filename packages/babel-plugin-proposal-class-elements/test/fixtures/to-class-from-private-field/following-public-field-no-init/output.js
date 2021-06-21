var _priv = /*#__PURE__*/new WeakMap();

class A {
  constructor() {
    babelHelpers.defineProperty(this, "pub1", 1);

    _priv.set(this, 2);

    babelHelpers.defineProperty(this, "pub2", void 0);
  }

}
