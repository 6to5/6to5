var z = {};
var x = babelHelpers.objectWithoutProperties(z, []);
var a = babelHelpers.objectWithoutProperties({
  a: 1
}, []);
var x = babelHelpers.objectWithoutProperties(a.b, []);
var x = babelHelpers.objectWithoutProperties(a(), []);
var {
  x1
} = z,
    y1 = babelHelpers.objectWithoutProperties(z, ["x1"]);
x1++;
var {
  [a]: b
} = z,
    c = babelHelpers.objectWithoutProperties(z, [a]);
var {
  x1
} = z,
    y1 = babelHelpers.objectWithoutProperties(z, ["x1"]);
let {
  x2,
  y2
} = z,
    z2 = babelHelpers.objectWithoutProperties(z, ["x2", "y2"]);
const {
  w3,
  x3,
  y3
} = z,
      z4 = babelHelpers.objectWithoutProperties(z, ["w3", "x3", "y3"]);
let {
  x: {
    a: xa,
    [d]: f
  }
} = complex,
    asdf = babelHelpers.objectWithoutProperties(complex.x, ["a", d]),
    d = babelHelpers.objectWithoutProperties(complex.y, []),
    g = babelHelpers.objectWithoutProperties(complex, ["x"]);
let {} = z,
    y4 = babelHelpers.objectWithoutProperties(z.x4, []);
var {
  z
} = babelHelpers.objectWithoutProperties({
  z: 1
}, []);
var {
  x = 5
} = babelHelpers.objectWithoutProperties({
  x: 1
}, []);