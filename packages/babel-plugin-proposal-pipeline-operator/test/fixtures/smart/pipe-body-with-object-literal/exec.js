function area(rect) {
  return rect.width * rect.height;
}

const result = -5
  |> Math.abs
  |> ({ width: #, height: # + 3 })
  |> area;

expect(result).toBe(40);
