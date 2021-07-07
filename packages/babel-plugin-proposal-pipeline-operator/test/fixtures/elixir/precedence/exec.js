
var inc = (x) => x + 1;

var result = 4 || 9 |> inc();
expect(result).toBe(5);
