var _priv = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv");

class A {
  static test() {
    [babelHelpers.classPrivateFieldLooseBase(this, _priv)[_priv]] = [3];
  }

}

Object.defineProperty(A, _priv, {
  writable: true,
  value: 2
})
