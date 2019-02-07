var Test =
/*#__PURE__*/
function (_Foo) {
  "use strict";

  babelHelpers.inheritsLoose(Test, _Foo);

  function Test() {
    var _Foo$prototype$test;

    var _this;

    woops.super.test();
    _this = _Foo.call(this) || this;

    _Foo.prototype.test.call(_this);

    _this = _Foo.apply(this, arguments) || this;
    _this = _Foo.call.apply(_Foo, [this, "test"].concat(Array.prototype.slice.call(arguments))) || this;

    _Foo.prototype.test.apply(_this, arguments);

    (_Foo$prototype$test = _Foo.prototype.test).call.apply(_Foo$prototype$test, [_this, "test"].concat(Array.prototype.slice.call(arguments)));

    return _this;
  }

  return Test;
}(Foo);
