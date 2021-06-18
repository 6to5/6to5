var _priv = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv1"),
    _priv2 = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv2"),
    _priv3 = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv3");

class A {
  static pub1 = 1;
  static pub2 = (Object.defineProperty(this, _priv, {
    writable: true,
    value: 2
  }), Object.defineProperty(this, _priv2, {
    writable: true,
    value: 3
  }), Object.defineProperty(this, _priv3, {
    writable: true,
    value: void 0
  }), 4);
}
