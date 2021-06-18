const f = class Foo {
  static #x = Foo;
  static y = Foo;
  static #z = Foo;

  static extract() {
    return {
      x: this.#x,
      y: this.y,
      z: this.#z,
    }
  }
};

const { x, y, z } = f.extract();
expect(x).toBe(f);
expect(y).toBe(f);
expect(z).toBe(f);
