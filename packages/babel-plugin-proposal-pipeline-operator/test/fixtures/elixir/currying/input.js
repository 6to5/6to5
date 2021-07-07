
var map = (fn) => (array) => array.map(fn);

var result = [10,20] |> map(x => x * 20)();

expect(result).toEqual([200, 400]);
