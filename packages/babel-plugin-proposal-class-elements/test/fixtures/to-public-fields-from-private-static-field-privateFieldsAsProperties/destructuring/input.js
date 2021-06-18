class A {
  static #priv = 2;

  static test() {
    [this.#priv] = [3];
  }
}
