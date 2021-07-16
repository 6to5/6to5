const keys = [];
export const foo = () => {
  var _iterator = babelHelpers.createForOfIteratorHelper(keys),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      const key = _step.value;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
};
export const bar = () => {
  const keys = [];

  for (var _i = 0, _keys = keys; _i < _keys.length; _i++) {
    const key = _keys[_i];
  }
};
