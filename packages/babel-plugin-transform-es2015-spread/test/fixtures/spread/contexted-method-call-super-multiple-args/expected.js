class Foo {
  bar() {
    super.bar.apply(this, [arg1, arg2].concat(babelHelpers.toConsumableArray(args)));
  }

}