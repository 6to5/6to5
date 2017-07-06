class Foo {
  bar() {
    super.bar.apply(this, babelHelpers.toConsumableArray(args));
  }

}