var _privateMethod;

class Base {
  superMethod() {
    return 'good';
  }

}

class Sub extends Base {
  #privateMethod = _privateMethod || (_privateMethod = function () {
    return babelHelpers.get(babelHelpers.getPrototypeOf(Sub.prototype), "superMethod", this).call(this);
  });

  superMethod() {
    return 'bad';
  }

  publicMethod() {
    return this.#privateMethod();
  }

}
