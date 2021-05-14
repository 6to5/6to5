class Cl {
  static #privateMethodA() {
    const i = 40;
    return i;
  }

  static #privateMethodB() {
    const i = 2;
    return i;
  }

  publicMethod() {
    return Cl.#privateMethodA() + Cl.#privateMethodB();
  }
}

expect((new Cl).publicMethod()).toEqual(42);