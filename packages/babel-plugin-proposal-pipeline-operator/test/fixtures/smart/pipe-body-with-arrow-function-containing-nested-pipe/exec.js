var result = 5
  |> Math.pow(#, 2)
  |> [ 10, 20, 30, 40, 50 ].filter(n => #
    |> n > #
    |> !#);

expect(result).toEqual([10, 20]);
