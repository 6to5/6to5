var _PRIVATE_STATIC_FIELD = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("PRIVATE_STATIC_FIELD"),
    _privateStaticFieldValue = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("privateStaticFieldValue");

class Cl {
  static getValue() {
    return babelHelpers.classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue];
  }

  static setValue() {
    babelHelpers.classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue] = "dank";
  }

}

Object.defineProperty(Cl, _privateStaticFieldValue, {
  get: _get_privateStaticFieldValue,
  set: _set_privateStaticFieldValue
})
Object.defineProperty(Cl, _PRIVATE_STATIC_FIELD, {
  writable: true,
  value: "top secret string"
})

function _get_privateStaticFieldValue() {
  return babelHelpers.classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD];
}

function _set_privateStaticFieldValue(newValue) {
  babelHelpers.classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD] = `Updated: ${newValue}`;
}
