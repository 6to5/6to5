let exfiltrated;

class Cl {
  constructor() {
    if (exfiltrated === undefined) {
      exfiltrated = (babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _privateStaticMethod);
    }
  }

}

function _privateStaticMethod() {
  return 1017;
}
