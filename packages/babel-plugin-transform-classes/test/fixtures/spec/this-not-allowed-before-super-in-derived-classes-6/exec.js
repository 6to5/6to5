class B {}

class A extends B {
  constructor() {
    const a = () => this;
    const b = () => this;
    b();
    super();
  }
}

expect(() => new A()).toThrow("this hasn't been initialised");
