var _privateField = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("privateField"),
    _privateFieldValue = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("privateFieldValue");

class Cl {
  constructor() {
    Object.defineProperty(this, _privateFieldValue, {
      get: void 0,
      set: _set_privateFieldValue
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 0
    });
    this.publicField = babelHelpers.classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue];
  }

}

function _set_privateFieldValue(newValue) {
  babelHelpers.classPrivateFieldLooseBase(this, _privateField)[_privateField] = newValue;
}
