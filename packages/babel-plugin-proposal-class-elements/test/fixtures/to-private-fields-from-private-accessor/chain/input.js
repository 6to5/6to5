class A {
  get #p() {}

  test() {
    this.#p.#p;
  }
}
