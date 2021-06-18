class A {
  v;

  set #priv1(_) { this.v = _ }

  get #priv2() {}

  test1() {
    [this.#priv1] = [3];
    return this.v;
  }

  test2() {
    [this.#priv2] = [3];
  }
}

expect(new A().test1()).toBe(3);
expect(() => new A().test2()).toThrow(TypeError);
