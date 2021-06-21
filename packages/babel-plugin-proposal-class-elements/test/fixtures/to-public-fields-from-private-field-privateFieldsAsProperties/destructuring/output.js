var _priv = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv");

class A {
  constructor() {
    Object.defineProperty(this, _priv, {
      writable: true,
      value: 2
    });
  }

  test() {
    [babelHelpers.classPrivateFieldLooseBase(this, _priv)[_priv]] = [3];
  }

}
