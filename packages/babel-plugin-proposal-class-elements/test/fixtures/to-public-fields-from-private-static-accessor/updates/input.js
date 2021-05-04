class Cl {
  static #privateField = "top secret string";
  static publicField = "not secret string";

  static get #privateFieldValue() {
    return Cl.#privateField;
  }

  static set #privateFieldValue(newValue) {
    Cl.#privateField = newValue;
  }

  static publicGetPrivateField() {
    return Cl.#privateFieldValue;
  }

  static publicSetPrivateField(newValue) {
    Cl.#privateFieldValue = newValue;
  }

  static get publicFieldValue() {
    return Cl.publicField;
  }

  static set publicFieldValue(newValue) {
    Cl.publicField = newValue;
  }

  static testUpdates() {
    Cl.#privateField = 0;
    Cl.publicField = 0;
    Cl.#privateFieldValue = Cl.#privateFieldValue++;
    Cl.publicFieldValue = Cl.publicFieldValue++;

    ++Cl.#privateFieldValue;
    ++Cl.publicFieldValue;

    Cl.#privateFieldValue += 1;
    Cl.publicFieldValue += 1;

    Cl.#privateFieldValue = -(Cl.#privateFieldValue ** Cl.#privateFieldValue);
    Cl.publicFieldValue = -(Cl.publicFieldValue ** Cl.publicFieldValue);
  }
}