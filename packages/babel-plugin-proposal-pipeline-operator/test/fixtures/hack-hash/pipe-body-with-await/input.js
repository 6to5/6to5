function triple (x) {
  return x * 3
}

async function asyncFunction(n) {
  return n
    |> Math.abs(#)
    |> await Promise.resolve(#)
    |> triple(#);
}

asyncFunction(-7).then(result => {
  expect(result).toBe(21);
});
