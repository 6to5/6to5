var _privateStaticMethod = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("privateStaticMethod");

class Cl {
  static staticMethod2() {
    return babelHelpers.classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
  }

  static staticMethod() {
    return babelHelpers.classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
  }

  static privateStaticMethod() {
    return babelHelpers.classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
  }

  publicMethod() {
    return babelHelpers.classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
  }

  constructor() {
    this.instanceField = babelHelpers.classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod]();
  }

}

Object.defineProperty(Cl, _privateStaticMethod, {
  value: _privateStaticMethod2
})

function _privateStaticMethod2() {
  return 1017;
}
