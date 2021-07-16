var result = 5
   |> # + 1
   |> # + #
   |> Math.pow(((x) => (x * 7))(#), 2)

expect(result).toBe(7056);
