var _privateField = /*#__PURE__*/new WeakMap(),
    _privateFieldValue = /*#__PURE__*/new WeakSet();

class Cl {
  constructor() {
    _privateFieldValue.add(this);

    _privateField.set(this, "top secret string");

    this.publicField = "not secret string";
  }

  publicGetPrivateField() {
    return babelHelpers.classPrivateAccessorGet2(this, _privateFieldValue, _get_privateFieldValue);
  }

  publicSetPrivateField(newValue) {
    babelHelpers.classPrivateAccessorSet2(this, _privateFieldValue, _set_privateFieldValue, newValue);
  }

}

function _get_privateFieldValue() {
  return babelHelpers.classPrivateFieldGet2(this, _privateField);
}

function _set_privateFieldValue(newValue) {
  babelHelpers.classPrivateFieldSet2(this, _privateField, newValue);
}
