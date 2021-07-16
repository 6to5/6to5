let i = 0;
let sum = 0;

while (_ref = (_i = i, i = _i + 1), _ref <= 10) {
  var _ref, _i;

  sum = sum + i;
}

expect(sum).toBe(10 + 9 + 8 + 7 + 6 + 5 + 4 + 3 + 2 + 1);
