var _foo = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("foo"),
    _bar = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("bar");

class A {}

Object.defineProperty(A, _foo, {
  writable: true,
  value: void 0
})
Object.defineProperty(A, _bar, {
  writable: true,
  value: 1
})
