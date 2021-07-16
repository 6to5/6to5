const result = -2.2 // -2.2
  |> Math.floor(%) // -3
  |> (() => Math.pow(%, 5)) // () => -243
  |> %(); // -243

expect(result).toBe(-243);
