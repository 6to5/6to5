var _foo = /*#__PURE__*/new WeakMap(),
    _bar = /*#__PURE__*/new WeakMap();

class A {
  constructor() {
    _foo.set(this, void 0);

    _bar.set(this, 1);
  }

}
