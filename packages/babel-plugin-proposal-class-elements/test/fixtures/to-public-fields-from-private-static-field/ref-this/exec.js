const f = class Foo {
  static #x = this;
  static y = this;
  static #z = this;

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
