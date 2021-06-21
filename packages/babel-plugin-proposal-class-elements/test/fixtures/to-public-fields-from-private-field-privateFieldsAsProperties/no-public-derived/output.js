var _foo = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("foo"),
    _bar = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("bar");

class A extends B {
  constructor(...args) {
    super(...args);
    Object.defineProperty(this, _foo, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _bar, {
      writable: true,
      value: 1
    });
  }

}
