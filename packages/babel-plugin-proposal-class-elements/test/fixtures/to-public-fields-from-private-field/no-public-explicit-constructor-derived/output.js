var _foo = /*#__PURE__*/new WeakMap(),
    _bar = /*#__PURE__*/new WeakMap();

class A extends B {
  constructor() {
    doStuff();
    super();

    _foo.set(this, void 0);

    _bar.set(this, 1);

    doOtherStuff(() => {
      var _temp;

      return _temp = super(), _foo.set(this, void 0), _bar.set(this, 1), _temp;
    });
  }

}
