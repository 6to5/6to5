// TODO: This should throw, but currently it doesn't

class Cl {
  static #PRIVATE_STATIC_FIELD = 0;

  static set #privateStaticFieldValue(newValue) {
    Cl.#PRIVATE_STATIC_FIELD = newValue;
  }

  static getPrivateStaticFieldValue() {
    return Cl.#privateStaticFieldValue;
  }
}

expect(() => Cl.getPrivateStaticFieldValue()).toThrow(TypeError)
