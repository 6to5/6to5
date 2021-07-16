var _ref, _;

var result = (_ref = (_ = 5, Math.pow(_, 2)), [10, 20, 30, 40, 50].filter(n => {
  var _ref2, _ref3;

  return _ref2 = (_ref3 = _ref, n > _ref3), !_ref2;
}));
expect(result).toEqual([10, 20]);
