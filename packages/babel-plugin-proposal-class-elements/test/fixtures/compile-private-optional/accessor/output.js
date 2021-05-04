var _foo;

class A {
  #foo = {
    __proto__: _foo ||= {
      get _() {},

      set _(_) {
        babelHelpers.readOnlyError("#foo");
      }

    },
    t: this
  };

  test() {
    var _this$prop$foo$_$bar$, _this$prop;

    (_this$prop$foo$_$bar$ = (_this$prop = this.prop) === null || _this$prop === void 0 ? void 0 : _this$prop.#foo._.bar.#foo._) === null || _this$prop$foo$_$bar$ === void 0 ? void 0 : _this$prop$foo$_$bar$.#foo._.baz;
  }

}
