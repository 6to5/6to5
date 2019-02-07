var Test =
/*#__PURE__*/
function (_Foo) {
  "use strict";

  babelHelpers.inheritsLoose(Test, _Foo);

  function Test() {
    var _this;

    _this = _Foo.call(this) || this;

    _Foo.prototype.test.whatever();

    _Foo.prototype.test.call(_this);

    return _this;
  }

  Test.test = function test() {
    return _Foo.wow.call(this);
  };

  return Test;
}(Foo);
