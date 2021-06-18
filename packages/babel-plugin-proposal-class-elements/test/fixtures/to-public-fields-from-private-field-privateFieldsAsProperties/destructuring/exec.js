class A {
  #priv = 2;

  test() {
    [this.#priv] = [3];
    return this.#priv;
  }
}

expect(new A().test()).toBe(3);
