var _foo;

class Cl {
  #foo = {
    __proto__: _foo || (_foo = {
      get _() {},

      set _(x) {}

    }),
    t: this
  };

  test() {
    this.#foo._?.bar;
    this?.#foo._;
    this?.self.#foo._;
  }

}
