var _priv = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv"),
    _method = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("method");

class Cl {
  constructor() {
    Object.defineProperty(this, _priv, {
      writable: true,
      value: babelHelpers.classPrivateFieldLooseBase(this, _method)[_method](2)
    });
  }

  prop = (Object.defineProperty(this, _method, {
    value: _method2
  }), babelHelpers.classPrivateFieldLooseBase(this, _method)[_method](1));

  getPriv() {
    return babelHelpers.classPrivateFieldLooseBase(this, _priv)[_priv];
  }

}

function _method2(x) {
  return x;
}
