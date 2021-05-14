class Cl {
  static staticMethod2() {
    return (babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _privateStaticMethod).call(Cl);
  }

  static staticMethod() {
    return (babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _privateStaticMethod).call(Cl);
  }

  static privateStaticMethod() {
    return (babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _privateStaticMethod).call(Cl);
  }

  publicMethod() {
    return (babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _privateStaticMethod).call(Cl);
  }

  constructor() {
    this.instanceField = (babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _privateStaticMethod).call(Cl);
  }

}

function _privateStaticMethod() {
  return 1017;
}
