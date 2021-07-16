return async function () {
  let obj = {};
  for await (obj.x of [1, 2]);

  expect(obj.x).toBe(2);
}();
