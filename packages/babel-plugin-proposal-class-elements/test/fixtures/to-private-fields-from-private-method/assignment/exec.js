class Foo {
    constructor() {
      this.publicField = this.#privateMethod();
    }
  
    #privateMethod() {
      return 42;
    }
  }
  
  expect((new Foo).publicField).toEqual(42);