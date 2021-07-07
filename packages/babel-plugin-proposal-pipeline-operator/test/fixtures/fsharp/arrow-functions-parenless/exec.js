const y = 2;

const f = (x) => (x |> (y) => y + 1)
  |> (z) => z * y

const _f = (x) => x
  |> (y) => y + 1
  |> (z) => z * y

const g = (x) => x
  |> (y) => (y + 1 |> (z) => z * y)

const _g = (x) => x
  |> (y => (y + 1 |> (z) => z * y))

const __g = (x) => x
  |> (
    y => {
      return (y + 1 |> (z) => z * y);
    }
  )

expect(  f(1)).toBe(4);
expect( _f(1)).toBe(4);
expect(  g(1)).toBe(2);
expect( _g(1)).toBe(2);
expect(__g(1)).toBe(2);

const cache = {};
const much = x => x + 0.5;
const work = x => x ** 2;

const memoizeF =           y => cache[y] ??= y |> much |> work;
const memoizeG = x => x |> y => cache[y] ??= y |> much |> work;

expect(memoizeF(1)).toBe(2.25);
expect(cache[1]).toBe(2.25);

expect(memoizeG(2)).toBe(6.25);
expect(cache[2]).toBe(6.25);
