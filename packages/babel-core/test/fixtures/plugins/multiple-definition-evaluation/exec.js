var code = `
  function foo() {
    var a = a ? a : a;
  }
`;

transform(code, {
  plugins: [
    function (b) {
      var t = b.types;
      return {
        visitor: {
          ConditionalExpression: function(path) {
            path.get("test").evaluateTruthy();
          }
        }
      }
    },
  ],
  configFile: false,
});
