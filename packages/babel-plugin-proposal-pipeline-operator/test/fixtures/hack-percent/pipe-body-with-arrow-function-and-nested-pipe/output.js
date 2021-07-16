var _ref, _ref5, _ref6;

const result = (_ref6 = (_ref5 = (_ref = 5, Math.pow(_ref, 2)), [1, 2, 3].map(n => {
  var _ref2, _ref3, _ref4;

  return _ref4 = (_ref3 = (_ref2 = n + _ref5, _ref2 * 2), `${_ref3} apples`), _ref4.toUpperCase();
})), _ref6.join());
expect(result).toEqual('52 APPLES,54 APPLES,56 APPLES');
