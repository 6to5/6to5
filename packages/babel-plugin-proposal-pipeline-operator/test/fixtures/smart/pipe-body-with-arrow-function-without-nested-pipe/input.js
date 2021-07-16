const result = -2.2   // -2.2
  |> Math.floor       // -3
  |> (() => Math.pow(#, 5))   // () => -243
  |> #()              // -243
  |> Math.sign;       // -1

expect(result).toBe(-1);
