var _priv = /*#__PURE__*/new WeakMap();

class A {
  constructor() {
    _priv.set(this, 2);
  }

  test() {
    [babelHelpers.classInstancePrivateFieldDestructureSet2(this, _priv)._] = [3];
  }

}
