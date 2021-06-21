class Base {
  static basePublicStaticMethod() {
    return 'good';
  }

}

class Sub extends Base {
  static #subStaticPrivateMethod = function () {
    return babelHelpers.get(babelHelpers.getPrototypeOf(Sub), "basePublicStaticMethod", this).call(this);
  };

  static basePublicStaticMethod() {
    return 'bad';
  }

  static check() {
    Sub.#subStaticPrivateMethod();
  }

}
