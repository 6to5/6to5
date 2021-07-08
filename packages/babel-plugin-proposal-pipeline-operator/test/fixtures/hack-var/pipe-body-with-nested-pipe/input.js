const result = 5
  |> Math.pow(var, 2)
  |> (var + 1
    |> `${var} apples`
    |> var.toUpperCase());

expect(result).toEqual('26 APPLES');
