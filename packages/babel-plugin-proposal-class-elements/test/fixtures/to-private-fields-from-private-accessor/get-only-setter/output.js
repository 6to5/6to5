var _privateFieldValue;

class Cl {
  #privateFieldValue = {
    __proto__: _privateFieldValue || (_privateFieldValue = {
      get _() {
        babelHelpers.writeOnlyError("#privateFieldValue");
      },

      set _(newValue) {
        this.t.#privateField = newValue;
      }

    }),
    t: this
  };
  #privateField = 0;

  constructor() {
    this.publicField = this.#privateFieldValue._;
  }

}
