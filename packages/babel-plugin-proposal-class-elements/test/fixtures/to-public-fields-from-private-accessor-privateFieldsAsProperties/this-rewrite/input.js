class A {
  get #foo() {
    this;
    () => this;
    (function() { this }).call(this);

    this.#foo;
    this.#foo = 2;
  }

  set #foo(x) {

  }
}
