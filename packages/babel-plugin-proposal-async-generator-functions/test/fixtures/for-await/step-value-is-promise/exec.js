let steps = [
  { done: false, value: Promise.resolve(1) },
  { done: true, value: undefined }
];

let iterable = {
  [Symbol.asyncIterator || "@@asyncIterator"]() {
    return {
      next: () => steps.shift(),
    };
  },
};

let values = [];

return async function () {
  let value;
  for await (value of iterable);

  expect(value).toBeInstanceOf(Promise);
  await expect(value).resolves.toBe(1);
}();
