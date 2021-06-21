class Cl {
  static staticMethod2() {
    return Cl.#privateStaticMethod();
  }

  static #privateStaticMethod() {
    return 1017;
  }

  static staticMethod() {
    return Cl.#privateStaticMethod();
  }

  static privateStaticMethod() {
    return Cl.#privateStaticMethod();
  }

  publicMethod() {
    return Cl.#privateStaticMethod();
  }

  constructor() {
    this.instanceField = Cl.#privateStaticMethod();
  }
}
