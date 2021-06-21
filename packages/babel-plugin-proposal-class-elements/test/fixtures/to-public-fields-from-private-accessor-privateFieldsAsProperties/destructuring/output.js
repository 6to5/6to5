var _priv = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv1"),
    _priv2 = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv2");

class A {
  constructor() {
    Object.defineProperty(this, _priv, {
      get: void 0,
      set: _set_priv
    });
    Object.defineProperty(this, _priv2, {
      get: _get_priv,
      set: void 0
    });
  }

  test1() {
    [babelHelpers.classPrivateFieldLooseBase(this, _priv)[_priv]] = [3];
  }

  test2() {
    [babelHelpers.classPrivateFieldLooseBase(this, _priv2)[_priv2]] = [3];
  }

}

function _set_priv(_) {}

function _get_priv() {}
