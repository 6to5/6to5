let foo = (() => {
  var _ref2 = babelHelpers.asyncToGenerator(function* (_ref) {
    let {
      a,
      b = mandatory("b")
    } = _ref;
    return Promise.resolve(b);
  });

  return function foo(_x) {
    return _ref2.apply(this, arguments);
  };
})();

function mandatory(paramName) {
  throw new Error(`Missing parameter: ${paramName}`);
}