// #3861
function t() {
  var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "default";
  var _ref = arguments[1];
  var a = _ref.a,
      b = _ref.b;

  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  console.log(x, a, b, args);
}
