var _ref, _;

function then(fn) {
  return async value => {
    return fn(await value);
  };
}

var result = (_ref = (_ = 1, (async x => (await x) + 1)(_)), then(x => x + 1)(_ref));
result.then(val => {
  expect(val).toBe(3);
});
