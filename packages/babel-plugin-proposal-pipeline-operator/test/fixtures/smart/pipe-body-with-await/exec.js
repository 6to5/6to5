const triple = (x) => x * 3;

async function myFunction(n) {
  return n
    |> Math.abs
    |> Promise.resolve(#)
    |> await #
    |> triple;
}

return myFunction(-7).then(result => {
  expect(result).toBe(21);
});
