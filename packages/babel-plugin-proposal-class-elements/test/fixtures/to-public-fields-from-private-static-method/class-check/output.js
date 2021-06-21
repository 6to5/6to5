class Cl {
  publicMethod(checked) {
    return (babelHelpers.classCheckPrivateStaticAccess(checked, Cl), _privateStaticMethod).call(checked);
  }

}

function _privateStaticMethod() {}
