var _excluded = ["x"];
var z = {};
var _z = z,
    x = babelHelpers.extends({}, _z);
var _z2 = z,
    x = _z2.x,
    y = babelHelpers.objectWithoutProperties(_z2, ["x"]);

var _z3 = z,
    _x = babelHelpers.toPropertyKey(x),
    x = _z3[_x],
    y = babelHelpers.objectWithoutProperties(_z3, [_x]);

(function (_ref) {
  var x = _ref.x,
      y = babelHelpers.objectWithoutProperties(_ref, _excluded);
});

var _o = o;
x = _o.x;
y = _o.y;
z = babelHelpers.objectWithoutProperties(_o, ["x", "y"]);
_o;
