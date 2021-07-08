function triple (x) {
  return x * 3
}

async function asyncFunction(n) {
  return n
    |> Math.abs(var)
    |> await Promise.resolve(var)
    |> triple(var);
}

asyncFunction(-7).then(result => {
  expect(result).toBe(21);
});
