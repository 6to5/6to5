var _privateField = /*#__PURE__*/new WeakMap(),
    _privateFieldValue = /*#__PURE__*/new WeakSet();

class Cl {
  constructor() {
    _privateFieldValue.add(this);

    _privateField.set(this, 0);

    this, babelHelpers.readOnlyError("#privateFieldValue");
  }

}

function _get_privateFieldValue() {
  return babelHelpers.classPrivateFieldGet2(this, _privateField);
}
