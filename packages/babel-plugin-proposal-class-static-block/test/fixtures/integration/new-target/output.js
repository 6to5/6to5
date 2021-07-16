class Base {
  constructor() {
    var _class, _temp;

    this.Foo = (_temp = _class = class {}, (() => {
      // fixme: new.target should be undefined after transformed
      _class.foo = void 0;
    })(), _temp);
  }

}

expect(new Base().Foo.foo).toBe(undefined);
