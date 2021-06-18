class A {
  #priv = 2;

  test() {
    [this.#priv] = [3];
  }
}
