var res = transform('', {
  plugins: [
    function (b) {
      var t = b.types;
      return {
        visitor: {
          Program: function(path) {
            if (this.done) return;
            // if (false) { if (true) 42; } else 23;
            var inner = t.ifStatement(t.booleanLiteral(true), t.expressionStatement(t.numericLiteral(42)), null);
            var outer = t.ifStatement(t.booleanLiteral(false), inner, t.expressionStatement(t.numericLiteral(23)));
            path.replaceWith(t.program([outer]));
            this.done = true;
          }
        }
      }
    },
  ],
  configFile: false,
});

expect(eval(res.code)).toBe(23);
