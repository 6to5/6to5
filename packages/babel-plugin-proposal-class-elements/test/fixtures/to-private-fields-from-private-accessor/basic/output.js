var _privateFieldValue;

class Cl {
  #privateFieldValue = {
    __proto__: _privateFieldValue || (_privateFieldValue = {
      get _() {
        return this.t.#privateField;
      },

      set _(newValue) {
        this.t.#privateField = newValue;
      }

    }),
    t: this
  };
  #privateField = "top secret string";

  constructor() {
    this.publicField = "not secret string";
  }

  publicGetPrivateField() {
    return this.#privateFieldValue._;
  }

  publicSetPrivateField(newValue) {
    this.#privateFieldValue._ = newValue;
  }

}
