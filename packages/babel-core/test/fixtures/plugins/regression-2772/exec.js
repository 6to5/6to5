var code = `
  (function() {
    var bar = 'lol';
    function foo(b){
      b === bar
      foo(b);
    }
  })();
`;

transform(code, {
  plugins: [
    function (b) {
      var t = b.types;
      return {
        visitor: {
          // Replace block statements with a new node without changing anything
          BlockStatement: function(path) {
            if (path.node.seen) {
              return;
            }

            var node = t.blockStatement(path.node.body);
            node.seen = true;
            path.replaceWith(node);
          },

          // do type inference
          BinaryExpression: function(path) {
            var left  = path.get("left");
            var right = path.get("right");
            left.baseTypeStrictlyMatches(right);
          }
        }
      };
    }
  ],
  configFile: false,
});
