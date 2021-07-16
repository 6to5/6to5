function triple(x) {
  return x * 3;
}

async function asyncFunction(n) {
  var _ref, _ref2, _ref3;

  return _ref3 = (_ref2 = (_ref = n, Math.abs(_ref)), await Promise.resolve(_ref2)), triple(_ref3);
}

asyncFunction(-7).then(result => {
  expect(result).toBe(21);
});
