class Cl {
  get #foo() {}
  set #foo(x) {}

  test() {
    this.#foo?.bar;
    this?.#foo;
    this?.self.#foo;
  }
}
