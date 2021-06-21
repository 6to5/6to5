var _priv = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv");

class A {
  static test() {
    [babelHelpers.classPrivateFieldLooseBase(this, _priv)[_priv]] = [3];
  }

}

Object.defineProperty(A, _priv, {
  value: _priv2
})

function _priv2() {}
