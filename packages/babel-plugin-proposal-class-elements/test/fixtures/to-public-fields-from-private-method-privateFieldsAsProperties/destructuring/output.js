var _priv = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv");

class A {
  constructor() {
    Object.defineProperty(this, _priv, {
      value: _priv2
    });
  }

  test() {
    [babelHelpers.classPrivateFieldLooseBase(this, _priv)[_priv]] = [3];
  }

}

function _priv2() {}
