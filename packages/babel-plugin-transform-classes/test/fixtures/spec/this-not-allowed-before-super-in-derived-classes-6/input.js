class B {}

class A extends B {
  constructor() {
    const a = () => this;
    const b = () => this;
    b();
    super();
  }
}

new A();
