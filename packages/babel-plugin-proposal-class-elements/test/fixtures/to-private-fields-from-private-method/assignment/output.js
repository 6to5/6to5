var _foo, _bar;

class Foo {
  #foo = _foo || (_foo = function () {
    return 42;
  });
  #bar = _bar || (_bar = function () {
    return 42;
  });

  constructor() {
    get(), babelHelpers.readOnlyError("#foo");
    babelHelpers.readOnlyError("#bar");

    class X {
      #foo;

      constructor() {
        this.#foo = 2;
        run(), babelHelpers.readOnlyError("#bar");
      }

    }
  }

}
