function *myGenerator(n) {
  return n
    |> (yield #)
    |> Math.abs;
}
