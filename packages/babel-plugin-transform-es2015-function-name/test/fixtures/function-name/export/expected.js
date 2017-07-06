export { _whatever as whatever };
export { _wowzers as default };
var _foo = "yes",
    foob = "no";
export { _foo as foo, foob };

function _whatever() {}

function _wowzers() {}

var bar = {
  foo: function foo() {
    _foo;
  },
  whatever: function whatever() {
    _whatever;
  },
  wowzers: function wowzers() {
    _wowzers;
  }
};