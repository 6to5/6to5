var _ref, _ref2, _ref3;

function area(rect) {
  return rect.width * rect.height;
}

const result = (_ref3 = (_ref2 = (_ref = -5, Math.abs(_ref)), {
  width: _ref2,
  height: _ref2 + 3
}), area(_ref3));
expect(result).toBe(40);
