function *myGenerator(n) {
  return n
  |> (yield %)
  |> Math.abs(%);
}

const myIterator = myGenerator(15);

const yieldedValue = myIterator.next().value;
const returnedValue = myIterator.next(-30).value;

expect(yieldedValue).toBe(15);
expect(returnedValue).toBe(30);
