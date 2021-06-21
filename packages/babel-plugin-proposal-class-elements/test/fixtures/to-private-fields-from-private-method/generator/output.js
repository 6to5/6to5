var _foo;

class Cl {
  #foo = _foo || (_foo = function* () {
    yield 2;
    return 3;
  });

  test() {
    return this.#foo();
  }

}
