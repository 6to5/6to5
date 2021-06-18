const f = class Foo {
  static #x() { return Foo; };
  static y;

  static extract() {
    return this.#x();
  }
};

const g = class Goo {
  static #x() { return Goo; };

  static extract() {
    return this.#x();
  }
};

expect(f.extract()).toBe(f);
expect(g.extract()).toBe(g);
