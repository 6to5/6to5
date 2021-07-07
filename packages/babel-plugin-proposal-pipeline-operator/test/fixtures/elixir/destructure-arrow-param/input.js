// Array destructing
const result = [0] |> (([x]) => x);
expect(result).toBe(0);

// Object destructuring
const result2 = { y: 1, z: 2 } |> (({ y, z }) => y + z);
expect(result).toBe(3);
