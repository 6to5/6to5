var inc = (x) => x + 1;
var double = (x) => x * 2;

expect(10 |> inc() |> double()).toBe(22);
