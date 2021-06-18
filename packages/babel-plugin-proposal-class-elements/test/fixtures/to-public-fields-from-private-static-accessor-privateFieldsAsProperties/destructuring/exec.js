class A {
  static set #priv1(_) { this.v = _ }

  static get #priv2() {}

  static test1() {
    [this.#priv1] = [3];
    return this.v;
  }

  static test2() {
    [this.#priv2] = [3];
  }
}

expect(A.test1()).toBe(3);
expect(() => A.test2()).toThrow(TypeError);
