class Foo extends Bar {
  constructor() {
    const fn = () => this;
    super();
    fn();
  }
}

// 'assertThisInitialized` should be cleanup
class A extends Bar {
  constructor() {
    super();
    const fn = () => this;
    this;
    fn();
  }
}
