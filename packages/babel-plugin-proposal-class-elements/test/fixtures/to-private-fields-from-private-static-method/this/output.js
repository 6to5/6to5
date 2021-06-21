class A {
  static get a() {
    return 1;
  }

}

class B extends A {
  static #getA = function () {
    return babelHelpers.get(babelHelpers.getPrototypeOf(B), "a", this);
  };
  static #getB = function () {
    return this.b;
  };

  static get b() {
    return 2;
  }

  static extract() {
    return [this.#getA, this.#getB];
  }

}

const [getA, getB] = B.extract();
