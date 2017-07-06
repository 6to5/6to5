define(["exports", "foo", "foo-bar", "./directory/foo-bar"], function (exports, _foo) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.test2 = exports.test = undefined;
  var foo2 = babelHelpers.interopRequireWildcard(_foo);
  exports.test = test;
  var test2 = exports.test2 = 5;
  exports.default = test;
  foo2.default;
  foo2;
  _foo.bar;
  _foo.foo;
});