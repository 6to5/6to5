var _ref, _ref2, _ref3;

const result = (_ref3 = (_ref2 = (_ref = 1, class {
  #baz;

  constructor() {
    this.#baz = _ref;
  }

  #bar() {
    return this.#baz + 2;
  }

  foo() {
    return this.#bar() + 3;
  }

}), new _ref2()), _ref3.foo());
expect(result).toBe(1 + 2 + 3);
