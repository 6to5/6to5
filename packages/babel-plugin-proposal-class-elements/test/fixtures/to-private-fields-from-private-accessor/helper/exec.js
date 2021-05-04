let foo;
class Cl {
  set #foo(v) { return 1 }
  test() {
    foo = this.#foo = 2;
  }
}

new Cl().test();

expect(foo).toBe(2);