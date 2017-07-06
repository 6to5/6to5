let g = (() => {
  var _ref = babelHelpers.asyncGenerator.wrap(function* () {
    var _this = this;

    () => this;

    function f() {
      () => this;
    }

    babelHelpers.asyncToGenerator(function* () {
      _this;
      yield 1;
    });
    yield babelHelpers.asyncGenerator.await(1);
  });

  return function g() {
    return _ref.apply(this, arguments);
  };
})();