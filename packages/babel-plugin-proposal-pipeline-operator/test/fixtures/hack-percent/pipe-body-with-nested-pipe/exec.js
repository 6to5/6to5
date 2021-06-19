const result = 5
  |> Math.pow(%, 2)
  |> (% + 1
    |> `${%} apples`
    |> %.toUpperCase());

expect(result).toEqual('26 APPLES');
