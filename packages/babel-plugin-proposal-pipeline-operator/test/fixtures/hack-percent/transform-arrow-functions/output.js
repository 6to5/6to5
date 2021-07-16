var _ref, _ref2;

const triple = function (x) {
  return x * 3;
};

const result = (_ref2 = (_ref = -7, Math.abs(_ref)), triple(_ref2));
return expect(result).toBe(21);
