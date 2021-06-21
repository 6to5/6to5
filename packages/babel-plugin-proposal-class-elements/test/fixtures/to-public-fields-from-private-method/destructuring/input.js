class A {
  #priv() {};

  test() {
    [this.#priv] = [3];
  }
}
