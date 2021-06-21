var _p;

class A {
  #p = {
    __proto__: _p || (_p = {
      get _() {},

      set _(_) {
        babelHelpers.readOnlyError("#p");
      }

    }),
    t: this
  };

  test() {
    this.#p._.#p._;
  }

}
