class Cl {
  static #privateFieldValue = {
    get _() {
      return Cl.#privateField;
    },

    set _(newValue) {
      Cl.#privateField = newValue;
    },

    t: this
  };
  static #privateField = "top secret string";
  static publicField = "not secret string";

  static publicGetPrivateField() {
    return Cl.#privateFieldValue._;
  }

  static publicSetPrivateField(newValue) {
    Cl.#privateFieldValue._ = newValue;
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
    Cl.#privateFieldValue._ = Cl.#privateFieldValue._++;
    Cl.publicFieldValue = Cl.publicFieldValue++;
    ++Cl.#privateFieldValue._;
    ++Cl.publicFieldValue;
    Cl.#privateFieldValue._ += 1;
    Cl.publicFieldValue += 1;
    Cl.#privateFieldValue._ = -(Cl.#privateFieldValue._ ** Cl.#privateFieldValue._);
    Cl.publicFieldValue = -(Cl.publicFieldValue ** Cl.publicFieldValue);
  }

}
