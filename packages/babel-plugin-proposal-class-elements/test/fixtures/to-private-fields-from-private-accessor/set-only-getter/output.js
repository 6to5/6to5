var _privateFieldValue;

class Cl {
  #privateFieldValue = {
    __proto__: _privateFieldValue || (_privateFieldValue = {
      get _() {
        return this.t.#privateField;
      },

      set _(_) {
        babelHelpers.readOnlyError("#privateFieldValue");
      }

    }),
    t: this
  };
  #privateField = 0;

  constructor() {
    this.#privateFieldValue._ = 1;
  }

}
