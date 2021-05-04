class Cl {
  #privateField = "top secret string";

  constructor() {
    this.publicField = "not secret string";
  }

  get #privateFieldValue() {
    return this.#privateField;
  }

  set #privateFieldValue(newValue) {
    this.#privateField = newValue;
  }

  publicGetPrivateField() {
    return this.#privateFieldValue;
  }

  publicSetPrivateField(newValue) {
    this.#privateFieldValue = newValue;
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
    this.#privateFieldValue = this.#privateFieldValue++;
    this.publicFieldValue = this.publicFieldValue++;

    ++this.#privateFieldValue;
    ++this.publicFieldValue;

    this.#privateFieldValue += 1;
    this.publicFieldValue += 1;

    this.#privateFieldValue = -(this.#privateFieldValue ** this.#privateFieldValue);
    this.publicFieldValue = -(this.publicFieldValue ** this.publicFieldValue);
  }
}