var code = `var foo = 1;
if (x) {
  const bar = 1;
}`;

var innerScope = true;
var res = transform(code, {
  plugins: opts.plugins.concat([
    function (b) {
      var t = b.types;
      return {
        visitor: {
          Scope: {
            exit: function(path) {
              if (innerScope) {
                assert(Object.keys(path.scope.bindings).length === 0, 'Inner scope should not have any bindings');
                innerScope = false;
                return;
              }

              assert(Object.keys(path.scope.bindings).length === 2, 'Outer scope subsume the inner-scope binding');
            }
          }
        }
      }
    }
  ]),
});

var expected = `var foo = 1;

if (x) {
  var bar = 1;
}`;

assert.equal(res.code, expected);
