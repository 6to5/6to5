var _ref, _;

var inc = x => x + 1;

var double = x => x * 2;

expect((_ref = (_ = 10, inc(_)), double(_ref))).toBe(22);
