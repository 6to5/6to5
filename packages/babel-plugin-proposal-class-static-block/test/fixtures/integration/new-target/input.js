class Base {
  constructor() {
    this.Foo = class {
      static {
        // fixme: new.target should be undefined after transformed
        this.foo = new.target;
      }
    }
  }
}
expect((new Base).Foo.foo).toBe(undefined);
