function area(rect) {
  return rect.width * rect.height;
}

const result = -5
  |> Math.abs(var)
  |> { width: var, height: var + 3 }
  |> area(var);

expect(result).toBe(40);
