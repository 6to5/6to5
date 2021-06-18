class Cl {
  static *#foo() {
    yield 2;
    return 3;
  }

  test() {
    return Cl.#foo();
  }
}
