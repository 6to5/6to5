var _priv = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv");

class A {
  static pub1 = 1;
  static pub2 = void Object.defineProperty(this, _priv, {
    writable: true,
    value: 2
  });
}
