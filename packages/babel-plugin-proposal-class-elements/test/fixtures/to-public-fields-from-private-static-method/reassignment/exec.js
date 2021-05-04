class Cl {
  static #privateStaticMethod() { }

  constructor() {
    expect(() => Cl.#privateStaticMethod = null).toThrow(TypeError);
  }
}

new Cl();