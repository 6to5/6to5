var _priv = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv1"),
    _priv2 = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv2");

class A {
  pub1 = 1;
  pub2 = void (Object.defineProperty(this, _priv, {
    writable: true,
    value: 2
  }), Object.defineProperty(this, _priv2, {
    writable: true,
    value: 3
  }));
}
