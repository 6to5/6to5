function somethingAdvanced(_ref, p2, p3) {
  var _ref$topLeft = _ref.topLeft;
  _ref$topLeft = _ref$topLeft === undefined ? {} : _ref$topLeft;
  var x1 = _ref$topLeft.x,
      y1 = _ref$topLeft.y,
      _ref$bottomRight = _ref.bottomRight;
  _ref$bottomRight = _ref$bottomRight === undefined ? {} : _ref$bottomRight;
  var x2 = _ref$bottomRight.x,
      y2 = _ref$bottomRight.y;
}

function unpackObject(_ref2) {
  var title = _ref2.title,
      author = _ref2.author;
  return title + " " + author;
}

console.log(unpackObject({
  title: "title",
  author: "author"
}));

var unpackArray = function (_ref3, _ref4) {
  var _ref6 = babelHelpers.slicedToArray(_ref3, 3),
      a = _ref6[0],
      b = _ref6[1],
      c = _ref6[2];

  var _ref5 = babelHelpers.slicedToArray(_ref4, 3),
      x = _ref5[0],
      y = _ref5[1],
      z = _ref5[2];

  return a + b + c;
};

console.log(unpackArray(["hello", ", ", "world"], [1, 2, 3]));