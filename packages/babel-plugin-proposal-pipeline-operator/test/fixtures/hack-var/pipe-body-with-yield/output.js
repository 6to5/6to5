function* myGenerator(n) {
  var _ref, _ref2;

  return _ref2 = (_ref = n, yield _ref), Math.abs(_ref2);
}

const myIterator = myGenerator(15);
const yieldedValue = myIterator.next().value;
const returnedValue = myIterator.next(-30).value;
expect(yieldedValue).toBe(15);
expect(returnedValue).toBe(30);
