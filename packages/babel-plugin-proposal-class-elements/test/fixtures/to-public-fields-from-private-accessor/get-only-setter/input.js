class Cl {
  #privateField = 0;

  set #privateFieldValue(newValue) {
    this.#privateField = newValue;
  }

  constructor() {
    this.publicField = this.#privateFieldValue;
  }
}
