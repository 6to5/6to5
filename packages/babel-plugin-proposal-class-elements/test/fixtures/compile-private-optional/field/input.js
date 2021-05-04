class A {
  #foo;

  test() {
    this.prop?.#foo.bar.#foo?.#foo.baz;
  }
}
