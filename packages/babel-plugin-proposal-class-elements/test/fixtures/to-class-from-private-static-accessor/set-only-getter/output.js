var _PRIVATE_STATIC_FIELD;

class Cl {
  static setPrivateStaticFieldValue() {
    Cl, babelHelpers.readOnlyError("#privateStaticFieldValue");
  }

}

_PRIVATE_STATIC_FIELD = 0;

function _get_privateStaticFieldValue() {
  return babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _PRIVATE_STATIC_FIELD;
}
