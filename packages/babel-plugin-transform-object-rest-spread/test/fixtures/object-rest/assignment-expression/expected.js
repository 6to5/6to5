var _c2;

({
  a1
} = c1);
var _c = c2;
({
  a2
} = _c);
b2 = babelHelpers.objectWithoutProperties(_c, ["a2"]);
console.log((_c2 = c3, ({
  a3
} = _c2), b3 = babelHelpers.objectWithoutProperties(_c2, ["a3"]), _c2));