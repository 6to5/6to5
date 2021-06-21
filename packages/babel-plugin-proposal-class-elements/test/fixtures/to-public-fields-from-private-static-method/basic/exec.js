const privateStaticValue = 1017;

class Cl {
  static staticMethod2() {
    return Cl.#privateStaticMethod();
  }

  static #privateStaticMethod() {
    return privateStaticValue;
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

expect((new Cl).publicMethod()).toEqual(privateStaticValue);
expect((new Cl).instanceField).toEqual(privateStaticValue);
expect(Cl.privateStaticMethod()).toEqual(privateStaticValue);
expect(Cl.staticMethod()).toEqual(privateStaticValue);
expect(Cl.staticMethod2()).toEqual(privateStaticValue);
