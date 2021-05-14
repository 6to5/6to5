var _PRIVATE_STATIC_FIELD;

class Cl {
  static getValue() {
    return babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _get_privateStaticFieldValue.call(Cl);
  }

  static setValue() {
    babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _set_privateStaticFieldValue.call(Cl, "dank");
  }

}

_PRIVATE_STATIC_FIELD = "top secret string";

function _get_privateStaticFieldValue() {
  return babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _PRIVATE_STATIC_FIELD;
}

function _set_privateStaticFieldValue(newValue) {
  babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _PRIVATE_STATIC_FIELD = `Updated: ${newValue}`;
}
