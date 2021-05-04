class Foo {
  constructor() {
    get().#foo = 2;
    this.#bar++;

    class X {
      #foo;

      constructor() {
        this.#foo = 2;
        this.#bar += run();
      }
    }
  }

  #foo() {
    return 42;
  }


  #bar() {
    return 42;
  }
}
