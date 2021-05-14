class Cl {
  async #foo() {
    return 2;
  }

  test() {
    return this.#foo();
  }
}
