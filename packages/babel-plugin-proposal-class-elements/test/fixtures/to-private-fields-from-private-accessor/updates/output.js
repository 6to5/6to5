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

  get publicFieldValue() {
    return this.publicField;
  }

  set publicFieldValue(newValue) {
    this.publicField = newValue;
  }

  testUpdates() {
    this.#privateField = 0;
    this.publicField = 0;
    this.#privateFieldValue._ = this.#privateFieldValue._++;
    this.publicFieldValue = this.publicFieldValue++;
    ++this.#privateFieldValue._;
    ++this.publicFieldValue;
    this.#privateFieldValue._ += 1;
    this.publicFieldValue += 1;
    this.#privateFieldValue._ = -(this.#privateFieldValue._ ** this.#privateFieldValue._);
    this.publicFieldValue = -(this.publicFieldValue ** this.publicFieldValue);
  }

}
