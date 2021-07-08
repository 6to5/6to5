const triple = function (x) {
  return x * 3;
};

async function myFunction(n) {
  var _ref, _ref2, _ref3, _ref4;

  return _ref4 = (_ref3 = (_ref2 = (_ref = n, Math.abs(_ref)), Promise.resolve(_ref2)), await _ref3), triple(_ref4);
}

return myFunction(-7).then(function (result) {
  expect(result).toBe(21);
});
