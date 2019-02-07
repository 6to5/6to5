var foo = "foo";

var bar = () => {};

var four = 4;

var _one = one();

var _ref = 2 * four + seven;

var _undefined = undefined;

var _computed = computed();

var _computed2 = computed();

var _ref2 = "test" + one;

var _ref3 = /regex/;
var _baz = baz;
var _ref4 = `template${expression}`;

var MyClass =
/*#__PURE__*/
function () {
  "use strict";

  function MyClass() {
    var _this = this;

    babelHelpers.classCallCheck(this, MyClass);
    _this[null] = "null";
    _this[_undefined] = "undefined";
    _this[void 0] = "void 0";
    _this[_ref3] = "regex";
    _this[foo] = "foo";
    _this[bar] = "bar";
    _this[_baz] = "baz";
    _this[`template`] = "template";
    _this[_ref4] = "template-with-expression";
  }

  babelHelpers.createClass(MyClass, [{
    key: _ref2,
    value: function () {}
  }, {
    key: "whatever",
    get: function () {},
    set: function (value) {}
  }, {
    key: _computed,
    get: function () {}
  }, {
    key: _computed2,
    set: function (value) {}
  }], [{
    key: 10,
    value: function () {}
  }]);
  return MyClass;
}();

MyClass[_one] = "test";
MyClass[2 * 4 + 7] = "247";
MyClass[2 * four + 7] = "247";
MyClass[_ref] = "247";
