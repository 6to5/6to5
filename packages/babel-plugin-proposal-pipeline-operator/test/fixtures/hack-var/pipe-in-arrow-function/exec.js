const result = () => -2.2 // -2.2
  |> Math.floor(var) // -3
  |> (() => Math.pow(var, 5)) // () => -243
  |> var(); // -243

expect(result()).toBe(-243);
