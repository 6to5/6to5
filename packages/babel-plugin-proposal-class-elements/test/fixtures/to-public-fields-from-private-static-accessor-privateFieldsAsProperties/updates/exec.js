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
    expect(Cl.#privateField).toEqual(Cl.publicField);

    ++Cl.#privateFieldValue;
    ++Cl.publicFieldValue;
    expect(Cl.#privateField).toEqual(Cl.publicField);

    Cl.#privateFieldValue += 1;
    Cl.publicFieldValue += 1;
    expect(Cl.#privateField).toEqual(Cl.publicField);
  }
}

Cl.testUpdates();