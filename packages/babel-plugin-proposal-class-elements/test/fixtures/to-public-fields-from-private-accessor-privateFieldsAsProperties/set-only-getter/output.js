var _privateField = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("privateField"),
    _privateFieldValue = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("privateFieldValue");

class Cl {
  constructor() {
    Object.defineProperty(this, _privateFieldValue, {
      get: _get_privateFieldValue,
      set: void 0
    });
    Object.defineProperty(this, _privateField, {
      writable: true,
      value: 0
    });
    babelHelpers.classPrivateFieldLooseBase(this, _privateFieldValue)[_privateFieldValue] = 1;
  }

}

function _get_privateFieldValue() {
  return babelHelpers.classPrivateFieldLooseBase(this, _privateField)[_privateField];
}
