function f() {
  var _this = this;

  let g = function () {
    var _ref = babelHelpers.asyncToGenerator(function* () {
      _this;
    });

    return function g() {
      return _ref.apply(this, arguments);
    };
  }();
}

class Class {
  m() {
    var _this2 = this;

    return babelHelpers.asyncToGenerator(function* () {
      var c = function () {
        var _ref2 = babelHelpers.asyncToGenerator(function* (b) {
          _this2;
        });

        return function c(_x) {
          return _ref2.apply(this, arguments);
        };
      }();
    })();
  }

}