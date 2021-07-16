let sum = 0;

for (var i = (_ = 0, _); i <= 10; i++) {
  var _;

  sum = sum + i;
}

expect(sum).toBe(10 + 9 + 8 + 7 + 6 + 5 + 4 + 3 + 2 + 1);
