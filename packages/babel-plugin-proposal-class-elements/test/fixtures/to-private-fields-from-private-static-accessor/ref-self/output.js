const f = class Foo {
  static #x = {
    get _() {
      return Foo;
    },

    set _(_) {
      babelHelpers.readOnlyError("#x");
    },

    t: this
  };
  static y;
};
const g = class Goo {
  static #x = {
    get _() {
      return Goo;
    },

    set _(_) {
      babelHelpers.readOnlyError("#x");
    },

    t: this
  };
};
