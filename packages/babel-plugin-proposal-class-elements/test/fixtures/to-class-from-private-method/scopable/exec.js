class Foo {
  #privateMethodA() {
    const i = 40;
    return i;
  }

  #privateMethodB() {
    const i = 2;
    return i;
  }

  publicMethod() {
    return this.#privateMethodA() + this.#privateMethodB();
  }
}

expect((new Foo).publicMethod()).toEqual(42);