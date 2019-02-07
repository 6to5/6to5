class Foo extends Bar {
  constructor() {
    if (eval("false")) super();
  }
}

class Baz extends Bar {
  constructor() {
    false && this;
    this;
  }
}
