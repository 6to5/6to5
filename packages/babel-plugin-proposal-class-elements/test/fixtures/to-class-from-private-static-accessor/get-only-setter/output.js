var _PRIVATE_STATIC_FIELD;

class Cl {
  static getPrivateStaticFieldValue() {
    return Cl, babelHelpers.writeOnlyError("#privateStaticFieldValue");
  }

}

_PRIVATE_STATIC_FIELD = 0;

function _set_privateStaticFieldValue(newValue) {
  babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _PRIVATE_STATIC_FIELD = newValue;
}
