var _foo;

class A {
  #foo = {
    __proto__: _foo || (_foo = {
      get _() {
        this.t;

        () => this.t;

        (function () {
          this;
        }).call(this.t);
        this.t.#foo._;
        this.t.#foo._ = 2;
      },

      set _(x) {}

    }),
    t: this
  };
}
