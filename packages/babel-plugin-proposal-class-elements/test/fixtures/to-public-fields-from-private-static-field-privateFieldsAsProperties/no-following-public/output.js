var _priv = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("priv"),
    _foo = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("foo"),
    _bar = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("bar");

class A {
  static pub = 3;
  static pub2 = (Object.defineProperty(this, _priv, {
    writable: true,
    value: 0
  }), 2);
}

Object.defineProperty(A, _foo, {
  writable: true,
  value: void 0
})
Object.defineProperty(A, _bar, {
  writable: true,
  value: 1
})
