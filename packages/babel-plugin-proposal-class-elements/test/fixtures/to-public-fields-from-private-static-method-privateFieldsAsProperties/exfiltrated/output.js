let exfiltrated;

var _privateStaticMethod = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("privateStaticMethod");

class Cl {
  constructor() {
    if (exfiltrated === undefined) {
      exfiltrated = babelHelpers.classPrivateFieldLooseBase(Cl, _privateStaticMethod)[_privateStaticMethod];
    }
  }

}

Object.defineProperty(Cl, _privateStaticMethod, {
  value: _privateStaticMethod2
})

function _privateStaticMethod2() {
  return 1017;
}
