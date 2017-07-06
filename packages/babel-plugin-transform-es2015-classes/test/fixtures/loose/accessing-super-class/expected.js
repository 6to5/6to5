var Test = function (_Foo) {
  babelHelpers.inheritsLoose(Test, _Foo);

  function Test() {
    var _Foo$prototype$test, _Foo$prototype$test2;

    woops.super.test();

    var _this = _Foo.call(this) || this;

    _Foo.prototype.test.call(_this);

    var _this = _Foo.apply(this, arguments) || this;

    var _this = _Foo.call.apply(_Foo, [this, "test"].concat(Array.prototype.slice.call(arguments))) || this;

    (_Foo$prototype$test = _Foo.prototype.test).call.apply(_Foo$prototype$test, [_this].concat(Array.prototype.slice.call(arguments)));

    (_Foo$prototype$test2 = _Foo.prototype.test).call.apply(_Foo$prototype$test2, [_this, "test"].concat(Array.prototype.slice.call(arguments)));

    return _this;
  }

  return Test;
}(Foo);