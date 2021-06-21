class Cl {
  static #privateStaticMethod() { }

  publicMethod(checked) {
    return checked.#privateStaticMethod();
  }
}