class Bar {}

class Foo extends Bar {
  constructor() {
    if (eval("false")) super();
  }
}
expect(() => new Foo()).toThrow("this hasn't been initialised");

class Baz extends Bar {
  constructor() {
    false && this;
    this;
  }
}
expect(() => new Baz()).toThrow("this hasn't been initialised");

class Qux extends Bar {
  constructor() {
    false && this;
  }
}
expect(() => new Qux()).toThrow("this hasn't been initialised");

class Ok extends Bar {
  constructor() {
    false && this;
    super()
  }
}
expect(() => new Ok()).not.toThrow();
