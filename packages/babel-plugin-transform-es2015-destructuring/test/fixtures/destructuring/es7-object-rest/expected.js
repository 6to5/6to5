var z = {};
var x = babelHelpers.objectWithoutProperties(z, []);
var x = z.x,
    y = babelHelpers.objectWithoutProperties(z, ["x"]);
var x = z[x],
    y = babelHelpers.objectWithoutProperties(z, [x]);

var _Symbol$for = Symbol.for("x");

var x = z[_Symbol$for],
    y = babelHelpers.objectWithoutProperties(z, [_Symbol$for]);

(function (_ref) {
  var x = _ref.x,
      y = babelHelpers.objectWithoutProperties(_ref, ["x"]);
});
