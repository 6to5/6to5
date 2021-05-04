class A {
  static set #priv1(_) {}

  static get #priv2() {}

  static test1() {
    [this.#priv1] = [3];
  }

  static test2() {
    [this.#priv2] = [3];
  }
}
