const triple = x => x * 3;

const result = -7 |> Math.abs(#) |> triple(#);

return expect(result).toBe(21);
