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

  get publicFieldValue() {
    return this.publicField;
  }

  set publicFieldValue(newValue) {
    this.publicField = newValue;
  }

  testUpdates() {
    var _this$privateFieldVal, _this$privateFieldVal2;

    babelHelpers.classPrivateFieldSet2(this, _privateField, 0);
    this.publicField = 0;
    babelHelpers.classPrivateAccessorSet2(this, _privateFieldValue, _set_privateFieldValue, (babelHelpers.classPrivateAccessorSet2(this, _privateFieldValue, _set_privateFieldValue, (_this$privateFieldVal2 = +babelHelpers.classPrivateAccessorGet2(this, _privateFieldValue, _get_privateFieldValue)) + 1), _this$privateFieldVal2));
    this.publicFieldValue = this.publicFieldValue++;
    babelHelpers.classPrivateAccessorSet2(this, _privateFieldValue, _set_privateFieldValue, +babelHelpers.classPrivateAccessorGet2(this, _privateFieldValue, _get_privateFieldValue) + 1);
    ++this.publicFieldValue;
    babelHelpers.classPrivateAccessorSet2(this, _privateFieldValue, _set_privateFieldValue, babelHelpers.classPrivateAccessorGet2(this, _privateFieldValue, _get_privateFieldValue) + 1);
    this.publicFieldValue += 1;
    babelHelpers.classPrivateAccessorSet2(this, _privateFieldValue, _set_privateFieldValue, -(babelHelpers.classPrivateAccessorGet2(this, _privateFieldValue, _get_privateFieldValue) ** babelHelpers.classPrivateAccessorGet2(this, _privateFieldValue, _get_privateFieldValue)));
    this.publicFieldValue = -(this.publicFieldValue ** this.publicFieldValue);
  }

}

function _get_privateFieldValue() {
  return babelHelpers.classPrivateFieldGet2(this, _privateField);
}

function _set_privateFieldValue(newValue) {
  babelHelpers.classPrivateFieldSet2(this, _privateField, newValue);
}
