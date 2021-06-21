class Cl {
  static #PRIVATE_STATIC_FIELD = "top secret string";

  static get #privateStaticFieldValue() {
    return Cl.#PRIVATE_STATIC_FIELD;
  }

  static set #privateStaticFieldValue(newValue) {
    Cl.#PRIVATE_STATIC_FIELD = `Updated: ${newValue}`;
  }

  static getValue() {
    return Cl.#privateStaticFieldValue;
  }

  static setValue() {
    Cl.#privateStaticFieldValue = "dank";
  }
}

expect(Cl.getValue()).toEqual("top secret string");
Cl.setValue();
expect(Cl.getValue()).toEqual("Updated: dank");