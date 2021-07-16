let resolve;
let promise = new Promise((r) => (resolve = r));
let iterable = {
  [Symbol.asyncIterator || "@@asyncIterator"]() {
    return {
      next: () => promise,
    };
  },
};

let values = [];

return Promise.all([
  async function () {
    for await (let value of iterable) {
      values.push(value);
    }
  }(),
  async function () {
    resolve({ value: 0, done: false });
    promise = new Promise((r) => (resolve = r));

    await null;
    resolve({ value: 1, done: false });
    promise = new Promise((r) => (resolve = r));

    resolve({ value: undefined, done: true });
  }(),
]).then(() => {
  expect(values).toEqual([0, 1]);
});
