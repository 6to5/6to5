class Foo {
  constructor() {
    this.Bar = class {
      static p = new.target
    }
  }
}

expect((new Foo).Bar.p).toBeUndefined()
