var _PRIVATE_STATIC_FIELD = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("PRIVATE_STATIC_FIELD"),
    _privateStaticFieldValue = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("privateStaticFieldValue");

class Cl {
  static setPrivateStaticFieldValue() {
    babelHelpers.classPrivateFieldLooseBase(Cl, _privateStaticFieldValue)[_privateStaticFieldValue] = 1;
  }

}

Object.defineProperty(Cl, _privateStaticFieldValue, {
  get: _get_privateStaticFieldValue,
  set: void 0
})
Object.defineProperty(Cl, _PRIVATE_STATIC_FIELD, {
  writable: true,
  value: 0
})

function _get_privateStaticFieldValue() {
  return babelHelpers.classPrivateFieldLooseBase(Cl, _PRIVATE_STATIC_FIELD)[_PRIVATE_STATIC_FIELD];
}
