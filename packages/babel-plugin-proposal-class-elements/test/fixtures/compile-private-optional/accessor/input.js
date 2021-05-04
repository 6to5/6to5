class A {
  get #foo() {};

  test() {
    this.prop?.#foo.bar.#foo?.#foo.baz;
  }
}
