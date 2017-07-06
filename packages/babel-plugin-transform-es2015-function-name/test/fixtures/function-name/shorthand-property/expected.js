var Utils = {
  get: function get() {}
};
var {
  get: _get
} = Utils;
var bar = {
  get: function get(arg) {
    _get(arg, "baz");
  }
};

var f = function f({
  foo: _foo = "bar"
}) {
  var obj = {
    // same name as parameter
    foo: function foo() {
      _foo;
    }
  };
};