function b() {
  var _this = this;

  var t = function (x) {
    return _this.x + x;
  };
}

class Foo extends function () {} {
  constructor() {
    var _this2;

    var foo = function () {
      return _this2;
    };

    if (true) {
      console.log(_this2 = super(), foo());
    } else {
      _this2 = super();
      console.log(foo());
    }
  }

}