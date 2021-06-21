var _foo, _bar;

class A {
  #foo = {
    __proto__: _foo || (_foo = {
      get _() {},

      set _(x) {}

    }),
    t: this
  };
  #bar = {
    __proto__: _bar || (_bar = {
      get _() {},

      set _(x) {}

    }),
    t: this
  };
  #baz;

  test() {
    var _baz;

    class B {
      #baz = {
        __proto__: _baz || (_baz = {
          get _() {},

          set _(x) {}

        }),
        t: this
      };
      #foo;

      [this.#foo._]() {
        this.#foo = 1;
        this.#bar._ = 2;
        this.#baz._ = 1.2;
      }

      [this.#bar._]() {
        this.#foo = 3;
        this.#bar._ = 4;
        this.#baz._ = 3.4;
      }

      [this.#baz]() {
        this.#foo = 5;
        this.#bar._ = 6;
        this.#baz._ = 5.6;
      }

    }
  }

}
