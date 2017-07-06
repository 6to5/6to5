class Test {
  static method1() {
    var _this = this;

    return babelHelpers.asyncToGenerator(function* () {
      console.log(_this);
      setTimeout(babelHelpers.asyncToGenerator(function* () {
        console.log(_this);
      }));
    })();
  }

  static method2() {
    var _this2 = this;

    return babelHelpers.asyncToGenerator(function* () {
      console.log(_this2);
      setTimeout((() => {
        var _ref2 = babelHelpers.asyncToGenerator(function* (arg) {
          console.log(_this2);
        });

        return function (_x) {
          return _ref2.apply(this, arguments);
        };
      })());
    })();
  }

  method1() {
    var _this3 = this;

    return babelHelpers.asyncToGenerator(function* () {
      console.log(_this3);
      setTimeout(babelHelpers.asyncToGenerator(function* () {
        console.log(_this3);
      }));
    })();
  }

  method2() {
    var _this4 = this;

    return babelHelpers.asyncToGenerator(function* () {
      console.log(_this4);
      setTimeout((() => {
        var _ref4 = babelHelpers.asyncToGenerator(function* (arg) {
          console.log(_this4);
        });

        return function (_x2) {
          return _ref4.apply(this, arguments);
        };
      })());
    })();
  }

}