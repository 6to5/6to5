const y = 2;

const f = x => {
  var _ref, _x;

  return _ref = (_x = x, _x + 1), _ref * y;
};

const g = x => {
  var _x2, _ref2;

  return _x2 = x, (_ref2 = _x2 + 1, _ref2 * _x2);
};

expect(f(1)).toBe(4);
expect(g(1)).toBe(2);
