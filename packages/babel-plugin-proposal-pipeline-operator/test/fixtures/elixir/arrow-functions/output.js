var _ref, _ref2, _ref3;

var result = (_ref = (_ref2 = (_ref3 = [5, 10], _ref3.map(x => x * 2)), _ref2.reduce((a, b) => a + b)), _ref + 1);
expect(result).toBe(31);

var inc = x => x + 1;

var double = x => x * 2;

var result2 = [4, 9].map(x => {
  var _ref4, _x;

  return _ref4 = (_x = x, inc(_x)), double(_ref4);
});
expect(result2).toEqual([10, 20]);
