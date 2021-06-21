class A {
  static #priv = 2;

  static test() {
    [this.#priv] = [3];
    return this.#priv;
  }
}

expect(A.test()).toBe(3);
