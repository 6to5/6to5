class Cl {
  static #privateStaticMethod() {
    return 1017;
  }

  publicMethod(checked) {
    return checked.#privateStaticMethod();
  }
}

const cl = new Cl();
expect(cl.publicMethod(Cl)).toBe(1017);