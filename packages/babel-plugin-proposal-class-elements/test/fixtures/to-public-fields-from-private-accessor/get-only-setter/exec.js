class Cl {
  #privateField = 0;

  set #privateFieldValue(newValue) {
    this.#privateField = newValue;
  }

  constructor() {
    expect(() => this.#privateFieldValue).toThrow(TypeError);
  }
}

const cl = new Cl();
