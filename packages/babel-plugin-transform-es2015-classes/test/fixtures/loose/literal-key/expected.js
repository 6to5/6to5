var Foo = function () {
  function Foo() {}

  Foo.prototype["bar"] = function bar() {};

  return Foo;
}();
