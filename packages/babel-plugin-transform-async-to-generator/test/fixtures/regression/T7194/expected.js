function f() {
  g(babelHelpers.asyncToGenerator(function* () {
    var _this = this;

    c(function () {
      return _this;
    });
  }));
}

babelHelpers.asyncToGenerator(function* () {
  var _this2 = this;

  console.log('async wrapper:', this === 'foo');

  (function () {
    console.log('nested arrow:', _this2 === 'foo');
  })();
}).call('foo');