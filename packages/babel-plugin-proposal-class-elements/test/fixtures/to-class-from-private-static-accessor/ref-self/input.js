const f = class Foo {
  static get #x() { return Foo; };
  static y;
};

const g = class Goo {
  static get #x() { return Goo; };
};

