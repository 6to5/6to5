var f0 = function (a) {
  var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : a;
  var c = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : b;
  return [a, b, c];
};

assert.deepEqual(f0(1), [1, 1, 1]);

var f1 = function (_ref) {
  var a = _ref.a;
  var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : a;
  var c = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : b;
  return [a, b, c];
};

assert.deepEqual(f1({
  a: 1
}), [1, 1, 1]);

var f2 = function (_ref2) {
  var a = _ref2.a;
  var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : a;
  var c = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : a;
  return [a, b, c];
};

assert.deepEqual(f2({
  a: 1
}), [1, 1, 1]);