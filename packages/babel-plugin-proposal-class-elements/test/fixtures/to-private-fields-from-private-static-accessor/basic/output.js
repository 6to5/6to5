class Cl {
  static #privateStaticFieldValue = {
    get _() {
      return Cl.#PRIVATE_STATIC_FIELD;
    },

    set _(newValue) {
      Cl.#PRIVATE_STATIC_FIELD = `Updated: ${newValue}`;
    },

    t: this
  };
  static #PRIVATE_STATIC_FIELD = "top secret string";

  static getValue() {
    return Cl.#privateStaticFieldValue._;
  }

  static setValue() {
    Cl.#privateStaticFieldValue._ = "dank";
  }

}
