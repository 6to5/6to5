var _ref;

var inc = x => x + 1;

var result = (_ref = 4 || 9, inc(_ref));
expect(result).toBe(5);
