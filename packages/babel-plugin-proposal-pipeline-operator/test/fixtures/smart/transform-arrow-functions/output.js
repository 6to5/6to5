var _ref, _;

const triple = function (x) {
  return x * 3;
};

const result = (_ref = (_ = -7, Math.abs(_)), triple(_ref));
return expect(result).toBe(21);
