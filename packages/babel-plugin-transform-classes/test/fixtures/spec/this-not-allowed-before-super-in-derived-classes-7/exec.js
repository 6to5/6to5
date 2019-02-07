class B {}

class A extends B {
  constructor() {
    this;
    return { foo: 'foo' }
  }
}

expect(() => new A()).toThrow("this hasn't been initialised");
