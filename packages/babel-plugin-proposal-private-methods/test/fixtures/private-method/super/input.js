class Base {
  superMethod() {
    return 'good';
  }
}

class Sub extends Base {
  #privateMethod() {
    return super.superMethod();
  }

  publicMethod() {
    return this.#privateMethod();
  }
}
