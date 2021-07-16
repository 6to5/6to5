function foo(x, obj) {
  var { [x]: x, ...rest } = obj;
  return x + '|' + Object.keys(rest);
}

expect(foo("b", { a:'b', b:'c', c:'a' })).toBe("c|a,c");
