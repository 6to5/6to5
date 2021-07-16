const triple = x => x * 3;

async function myFunction(n) {
  var _ref, _ref2, _ref3, _n;

  return _ref = (_ref2 = (_ref3 = (_n = n, Math.abs(_n)), Promise.resolve(_ref3)), await _ref2), triple(_ref);
}

return myFunction(-7).then(result => {
  expect(result).toBe(21);
});
