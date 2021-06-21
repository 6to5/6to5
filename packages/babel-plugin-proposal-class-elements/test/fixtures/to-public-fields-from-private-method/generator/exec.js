class Cl {
  *#foo() {
    yield 2;
    return 3;
  }

  test() {
    return this.#foo();
  }
}

const val = new Cl().test();
expect(val.next()).toEqual({ value: 2, done: false });
expect(val.next()).toEqual({ value: 3, done: true });
