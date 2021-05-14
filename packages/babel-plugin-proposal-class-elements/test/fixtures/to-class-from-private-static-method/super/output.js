class Base {
  static basePublicStaticMethod() {
    return 'good';
  }

}

class Sub extends Base {
  static basePublicStaticMethod() {
    return 'bad';
  }

  static check() {
    (babelHelpers.classCheckPrivateStaticAccess(Sub, Sub), _subStaticPrivateMethod).call(Sub);
  }

}

function _subStaticPrivateMethod() {
  return babelHelpers.get(babelHelpers.getPrototypeOf(Sub), "basePublicStaticMethod", this).call(this);
}
