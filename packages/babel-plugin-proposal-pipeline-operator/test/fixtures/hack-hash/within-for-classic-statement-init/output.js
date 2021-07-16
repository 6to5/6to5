let sum = 0;

for (var i = (_ref = 0, _ref); i <= 10; i++) {
  var _ref;

  sum += i;
}

expect(sum).toBe(10 + 9 + 8 + 7 + 6 + 5 + 4 + 3 + 2 + 1);
