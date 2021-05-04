class Cl {
  #privateField = 0;

  get #privateFieldValue() {
    return this.#privateField;
  }

  constructor() {
    expect(() => this.#privateFieldValue = 1).toThrow(TypeError);
  }
}

const cl = new Cl();
