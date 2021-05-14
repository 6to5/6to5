class A {
  static get a() { return 1 }
}

class B extends A {
  static get b() { return 2 }

  static #getA() { return super.a }
  static #getB() { return this.b }

  static extract() {
    return [this.#getA, this.#getB];
  }
}

const [getA, getB] = B.extract();