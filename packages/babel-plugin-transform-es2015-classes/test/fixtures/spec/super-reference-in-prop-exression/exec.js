let called = false;

class A {
  method() {
    called = true;
  }

  get methodName() {
    return "method";
  }
}

class B extends A {
  constructor() {
    super[super().methodName]()
  }
}

new B();
assert.equal(called, true);
