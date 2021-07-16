const result = 5
  |> Math.pow(#, 2)
  |> [1, 2, 3].map(n => n + #
    |> # * 2
    |> `${#} apples`
    |> #.toUpperCase())
  |> #.join();

expect(result).toEqual('52 APPLES,54 APPLES,56 APPLES');
