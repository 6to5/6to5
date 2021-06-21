// TODO: This should throw, but currently it doesn't
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
