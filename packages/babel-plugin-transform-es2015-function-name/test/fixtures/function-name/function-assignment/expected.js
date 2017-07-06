var foo;

foo = function foo() {};

var _baz;

_baz = function baz() {
  _baz();
};

_baz = 12;

bar = function (_bar) {
  function bar() {
    return _bar.apply(this, arguments);
  }

  bar.toString = function () {
    return _bar.toString();
  };

  return bar;
}(function () {
  bar();
});