class Cl {
  static #privateStaticMethod = function () {};

  publicMethod(checked) {
    return checked.#privateStaticMethod();
  }

}
