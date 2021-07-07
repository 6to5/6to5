var _;

var inc = x => x + 1;

expect((_ = 10, inc(_))).toBe(11);
