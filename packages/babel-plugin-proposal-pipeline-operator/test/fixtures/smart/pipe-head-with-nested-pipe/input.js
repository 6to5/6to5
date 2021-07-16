const result = (5 |> Math.pow(#, 2)) |> # + 1;

expect(result).toEqual(26);
