const f = class Foo {
  static #x = function () {
    return Foo;
  };
  static y;
};
const g = class Goo {
  static #x = function () {
    return Goo;
  };
};
