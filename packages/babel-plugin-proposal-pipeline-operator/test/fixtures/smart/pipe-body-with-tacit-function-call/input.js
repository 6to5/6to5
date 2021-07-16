const abs = Math.abs;

const value = -5.9
|> abs
|> Math.floor;

expect(value).toBe(5);
