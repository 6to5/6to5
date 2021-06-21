var _privateField = /*#__PURE__*/new WeakMap(),
    _privateFieldValue = /*#__PURE__*/new WeakSet();

class Cl {
  constructor() {
    _privateFieldValue.add(this);

    _privateField.set(this, 0);

    this.publicField = (this, babelHelpers.writeOnlyError("#privateFieldValue"));
  }

}

function _set_privateFieldValue(newValue) {
  babelHelpers.classPrivateFieldSet2(this, _privateField, newValue);
}
