class A {
  #priv() {};

  test() {
    [this.#priv] = [3];
  }
}

expect(() => new A().test()).toThrow(TypeError);
