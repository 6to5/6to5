var code = "function f() {}";
transform(code, {
  plugins: [
    function() {
      return {
        visitor: {
          FunctionDeclaration: function(path) {
            throw new Error("someMsg");
          },
        },
      };
    },
  ],
  filename: "/fake/path/example.js",
  configFile: false,
});
