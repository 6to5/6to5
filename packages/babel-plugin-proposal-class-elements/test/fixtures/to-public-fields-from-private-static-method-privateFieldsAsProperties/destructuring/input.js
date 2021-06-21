class A {
  static #priv() {};

  static test() {
    [this.#priv] = [3];
  }
}
