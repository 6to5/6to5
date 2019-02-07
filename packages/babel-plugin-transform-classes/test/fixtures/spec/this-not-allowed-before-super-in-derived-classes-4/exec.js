class Bar {}

class Foo extends Bar {
  constructor() {
    const fn = () => this;
    super();
    fn();
  }
}

new Foo();

class A extends Bar {
  constructor() {
    super();
    const fn = () => this;
    fn();
  }
}

new A();
