let sum = 0;
for (var i = 0 |> var; i <= 10; i++)
  sum += i;

expect(sum).toBe(10 + 9 + 8 + 7 + 6 + 5 + 4 + 3 + 2 + 1);
