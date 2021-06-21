class Cl {
  static #PRIVATE_STATIC_FIELD = 0;

  static get #privateStaticFieldValue() {
    return Cl.#PRIVATE_STATIC_FIELD;
  }

  static setPrivateStaticFieldValue() {
    Cl.#privateStaticFieldValue = 1;
  }
}