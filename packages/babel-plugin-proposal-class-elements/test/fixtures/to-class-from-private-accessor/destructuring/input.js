class A {
  set #priv1(_) {}

  get #priv2() {}

  test1() {
    [this.#priv1] = [3];
  }

  test2() {
    [this.#priv2] = [3];
  }
}
