class Cl {
  static #privateStaticFieldValue = {
    get _() {
      return Cl.#PRIVATE_STATIC_FIELD;
    },

    set _(_) {
      babelHelpers.readOnlyError("#privateStaticFieldValue");
    },

    t: this
  };
  static #PRIVATE_STATIC_FIELD = 0;

  static setPrivateStaticFieldValue() {
    Cl.#privateStaticFieldValue._ = 1;
  }

}
