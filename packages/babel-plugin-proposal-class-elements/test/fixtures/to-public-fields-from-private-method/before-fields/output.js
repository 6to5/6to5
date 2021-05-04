var _priv = /*#__PURE__*/new WeakMap(),
    _method = /*#__PURE__*/new WeakSet();

class Cl {
  constructor() {
    _priv.set(this, babelHelpers.classPrivateMethodGet(this, _method, _method2).call(this, 2));
  }

  prop = (_method.add(this), babelHelpers.classPrivateMethodGet(this, _method, _method2).call(this, 1));

  getPriv() {
    return babelHelpers.classPrivateFieldGet2(this, _priv);
  }

}

function _method2(x) {
  return x;
}
