const f = class Foo {
  static #x() { return Foo; };
  static y;
};

const g = class Goo {
  static #x() { return Goo; };
};

