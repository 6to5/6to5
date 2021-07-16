const keys = [];

function a() {
  for (var _i = 0, _keys = keys; _i < _keys.length; _i++) {
    const key = _keys[_i];
  }
}

const b = () => {
  for (var _i2 = 0, _keys2 = keys; _i2 < _keys2.length; _i2++) {
    const key = _keys2[_i2];
  }
};

const c = function () {
  for (var _i3 = 0, _keys3 = keys; _i3 < _keys3.length; _i3++) {
    const key = _keys3[_i3];
  }
};

const {
  foo
} = () => {
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
