var _privateStaticMethod = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("privateStaticMethod");

class Cl {
  publicMethod(checked) {
    return babelHelpers.classPrivateFieldLooseBase(checked, _privateStaticMethod)[_privateStaticMethod]();
  }

}

Object.defineProperty(Cl, _privateStaticMethod, {
  value: _privateStaticMethod2
})

function _privateStaticMethod2() {}
