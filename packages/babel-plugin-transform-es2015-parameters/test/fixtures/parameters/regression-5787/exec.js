function f(a, ...rest) {
  let b = rest[rest.length - 3];
  let c = rest[rest.length - 2];
  let d = rest[rest.length - 1];
  return [a, b, c, d];
};

assert.deepEqual(f(1, 2), [1, undefined, undefined, 2])
