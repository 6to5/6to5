let i = 0
let sum = 0

while (i |> (i = # + 1) |> # <= 10)
  sum = sum + i;

expect(sum).toBe(10 + 9 + 8 + 7 + 6 + 5 + 4 + 3 + 2 + 1)
