class Base {
  static basePublicStaticMethod() {
    return 'good';
  }
}

class Sub extends Base {
  static basePublicStaticMethod() {
    return 'bad';
  }

  static #subStaticPrivateMethod() {
    return super.basePublicStaticMethod();
  }

  static check() {
    Sub.#subStaticPrivateMethod();
  }
}
