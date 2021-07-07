async function myFunction(n) {
  return n
    |> Math.abs()
    |> await Promise.resolve();
}
