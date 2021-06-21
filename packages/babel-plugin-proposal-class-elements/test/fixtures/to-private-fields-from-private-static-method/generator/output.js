class Cl {
  static #foo = function* () {
    yield 2;
    return 3;
  };

  test() {
    return Cl.#foo();
  }

}
