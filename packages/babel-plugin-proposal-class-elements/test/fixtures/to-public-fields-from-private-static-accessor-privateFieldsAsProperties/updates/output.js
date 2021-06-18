var _privateField = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("privateField"),
    _privateFieldValue = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("privateFieldValue");

class Cl {
  static publicField = (Object.defineProperty(this, _privateFieldValue, {
    get: _get_privateFieldValue,
    set: _set_privateFieldValue
  }), Object.defineProperty(this, _privateField, {
    writable: true,
    value: "top secret string"
  }), "not secret string");

  static publicGetPrivateField() {
    return babelHelpers.classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue];
  }

  static publicSetPrivateField(newValue) {
    babelHelpers.classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] = newValue;
  }

  static get publicFieldValue() {
    return Cl.publicField;
  }

  static set publicFieldValue(newValue) {
    Cl.publicField = newValue;
  }

  static testUpdates() {
    babelHelpers.classPrivateFieldLooseBase(Cl, _privateField)[_privateField] = 0;
    Cl.publicField = 0;
    babelHelpers.classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] = babelHelpers.classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue]++;
    Cl.publicFieldValue = Cl.publicFieldValue++;
    ++babelHelpers.classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue];
    ++Cl.publicFieldValue;
    babelHelpers.classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] += 1;
    Cl.publicFieldValue += 1;
    babelHelpers.classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] = -(babelHelpers.classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue] ** babelHelpers.classPrivateFieldLooseBase(Cl, _privateFieldValue)[_privateFieldValue]);
    Cl.publicFieldValue = -(Cl.publicFieldValue ** Cl.publicFieldValue);
  }

}

function _get_privateFieldValue() {
  return babelHelpers.classPrivateFieldLooseBase(Cl, _privateField)[_privateField];
}

function _set_privateFieldValue(newValue) {
  babelHelpers.classPrivateFieldLooseBase(Cl, _privateField)[_privateField] = newValue;
}
