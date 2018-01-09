var obj = babelHelpers.defineProperty(babelHelpers.defineProperty({}, foobar, function () {
  return "foobar";
}), "test", function () {
  return "regular method after computed property";
});
