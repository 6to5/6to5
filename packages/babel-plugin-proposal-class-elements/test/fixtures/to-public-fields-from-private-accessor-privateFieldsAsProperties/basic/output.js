var _privateField = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("privateField"),
    _privateFieldValue = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("privateFieldValue");

class Cl {
  constructor() {
    Object.defineProperty(this, _privateFieldValue, {
      get: _get_privateFieldValue,
      set: _set_privateFieldValue
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: "top secret string"
    });
    this.publicField = "not secret string";
  }

  publicGetPrivateField() {
    return babelHelpers.classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
  }

  publicSetPrivateField(newValue) {
    babelHelpers.classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = newValue;
  }

}

function _get_privateFieldValue() {
  return babelHelpers.classPrivateFieldLooseBase(this, _privateField)[_privateField];
}

function _set_privateFieldValue(newValue) {
  babelHelpers.classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
}
