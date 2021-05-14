var _privateField;

class Cl {
  static publicGetPrivateField() {
    return babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _get_privateFieldValue.call(Cl);
  }

  static publicSetPrivateField(newValue) {
    babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _set_privateFieldValue.call(Cl, newValue);
  }

  static get publicFieldValue() {
    return Cl.publicField;
  }

  static set publicFieldValue(newValue) {
    Cl.publicField = newValue;
  }

  static testUpdates() {
    var _Cl$privateFieldValue, _Cl$privateFieldValue2;

    babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _privateField = 0;
    Cl.publicField = 0;
    babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _set_privateFieldValue.call(Cl, ((babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _set_privateFieldValue.call(Cl, (_Cl$privateFieldValue2 = +(babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _get_privateFieldValue.call(Cl))) + 1)), _Cl$privateFieldValue2));
    Cl.publicFieldValue = Cl.publicFieldValue++;
    babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _set_privateFieldValue.call(Cl, +(babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _get_privateFieldValue.call(Cl)) + 1);
    ++Cl.publicFieldValue;
    babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _set_privateFieldValue.call(Cl, (babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _get_privateFieldValue.call(Cl)) + 1);
    Cl.publicFieldValue += 1;
    babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _set_privateFieldValue.call(Cl, -((babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _get_privateFieldValue.call(Cl)) ** (babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _get_privateFieldValue.call(Cl))));
    Cl.publicFieldValue = -(Cl.publicFieldValue ** Cl.publicFieldValue);
  }

}

_privateField = "top secret string";
babelHelpers.defineProperty(Cl, "publicField", "not secret string");

function _get_privateFieldValue() {
  return babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _privateField;
}

function _set_privateFieldValue(newValue) {
  babelHelpers.classCheckPrivateStaticAccess(Cl, Cl), _privateField = newValue;
}
