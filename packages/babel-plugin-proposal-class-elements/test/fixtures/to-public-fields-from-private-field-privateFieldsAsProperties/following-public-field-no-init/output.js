var _priv = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv");

class A {
  pub1 = 1;
  pub2 = void Object.defineProperty(this, _priv, {
    writable: true,
    value: 2
  });
}
