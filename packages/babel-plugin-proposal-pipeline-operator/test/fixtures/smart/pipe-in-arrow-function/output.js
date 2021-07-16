const result = () => {
  var _ref, _ref2, _;

  return _ref = (_ref2 = (_ = -2.2 // -2.2
  , Math.floor(_) // -3
  ), () => Math.pow(_ref2, 5) // () => -243
  ), _ref();
}; // -243


expect(result()).toBe(-243);
