const _foo = foo(),
      {
  s
} = _foo,
      t = babelHelpers.objectWithoutProperties(_foo, ["s"]);

const _bar = bar(),
      {
  s: {
    q1
  }
} = _bar,
      q2 = babelHelpers.objectWithoutProperties(_bar.s, ["q1"]),
      q3 = babelHelpers.objectWithoutProperties(_bar, ["s"]);

const {
  a
} = foo((_ref) => {
  let {
    b
  } = _ref,
      c = babelHelpers.objectWithoutProperties(_ref, ["b"]);
  console.log(b, c);
});