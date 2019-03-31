class Base {
  static basePublicStaticMethod() {
    return 'good';
  }
}

class Sub extends Base {
  static #subStaticPrivateMethod() {
    return super.basePublicStaticMethod();
  }

  static check() {
    return Sub.#subStaticPrivateMethod();
  }
}

expect(Sub.check()).toEqual('good');
