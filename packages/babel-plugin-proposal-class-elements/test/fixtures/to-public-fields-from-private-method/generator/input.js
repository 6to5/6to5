class Cl {
  *#foo() {
    yield 2;
    return 3;
  }

  test() {
    return this.#foo();
  }
}
