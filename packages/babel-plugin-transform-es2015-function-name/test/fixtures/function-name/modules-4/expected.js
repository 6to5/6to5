export { _foo as foo };

function _foo(bar) {}

var bar = {
  foo: function foo() {
    _foo;
  }
};