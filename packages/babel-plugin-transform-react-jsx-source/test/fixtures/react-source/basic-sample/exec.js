var actual = transform(
  'var x = <sometag />',
  Object.assign({}, opts, { filename: '/fake/path/mock.js' })
).code;

var expected = multiline([
  'var _jsxFileName = "/fake/path/mock.js";',
  'var x = <sometag __source={{',
  '  fileName: _jsxFileName,',
  '  lineNumber: 1,',
  '  colNumber: 8,',
  '  toLineNumber: 1',
  '}} />;',
]);

expect(actual).toBe(expected);
