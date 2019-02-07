class Bar {}

class Foo extends Bar {
  constructor() {
    this.foo = "bar";
    this.bar = 2
    super();
  }
}

expect(() => new Foo()).toThrow();
