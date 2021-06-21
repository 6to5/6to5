class Base {
  static basePublicStaticMethod() {
    return 'good';
  }

}

var _subStaticPrivateMethod = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("subStaticPrivateMethod");

class Sub extends Base {
  static basePublicStaticMethod() {
    return 'bad';
  }

  static check() {
    babelHelpers.classPrivateFieldLooseBase(Sub, _subStaticPrivateMethod)[_subStaticPrivateMethod]();
  }

}

Object.defineProperty(Sub, _subStaticPrivateMethod, {
  value: _subStaticPrivateMethod2
})

function _subStaticPrivateMethod2() {
  return babelHelpers.get(babelHelpers.getPrototypeOf(Sub), "basePublicStaticMethod", this).call(this);
}
