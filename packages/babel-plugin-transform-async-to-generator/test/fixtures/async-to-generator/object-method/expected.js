let obj = {
  a: 123,

  foo(bar) {
    return babelHelpers.asyncToGenerator(function* () {
      return yield baz(bar);
    })();
  }

};