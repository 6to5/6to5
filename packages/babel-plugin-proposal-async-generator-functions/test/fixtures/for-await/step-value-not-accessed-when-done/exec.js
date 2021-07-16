let gotValue = false;

let iterable = {
  [Symbol.asyncIterator || "@@asyncIterator"]() {
    return {
      next: () => Promise.resolve({
        get value() { gotValue = true },
        done: true
      })
    };
  },
};

return async function () {
  for await (let value of iterable) {}

  expect(gotValue).toBe(false);
}();
