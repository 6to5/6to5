class A {
  static #priv() {};

  static test() {
    [this.#priv] = [3];
  }
}

expect(() => A.test()).toThrow(TypeError);
