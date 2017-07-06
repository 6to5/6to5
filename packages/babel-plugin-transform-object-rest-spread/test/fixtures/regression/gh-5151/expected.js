const {
  x
} = a,
      y = babelHelpers.objectWithoutProperties(a, ["x"]),
      z = foo(y);
const s = babelHelpers.objectWithoutProperties(r, []),
      t = foo(s); // ordering is preserved

var l = foo(),
    _bar = bar(),
    {
  m: {
    n
  }
} = _bar,
    o = babelHelpers.objectWithoutProperties(_bar.m, ["n"]),
    p = babelHelpers.objectWithoutProperties(_bar, ["m"]),
    q = baz();