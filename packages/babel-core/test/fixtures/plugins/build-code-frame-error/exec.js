expect(() => {
  var code = "function f() {}";
  transform(code, {
    plugins: [
      function() {
        return {
          visitor: {
            FunctionDeclaration: function(path) {
              throw path.buildCodeFrameError("someMsg");
            },
          },
        };
      },
    ],
    // hard to assert on ANSI escape codes
    highlightCode: false,
  });
}).toThrow(/^unknown file: someMsg\s+> 1 \| function f\(\) {}/);
