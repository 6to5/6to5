var code = (function() {
  var kind;
  function readObj() {
    expect('{');
    if (!skip('}')) {
      do {
        expect('String');
        expect(':');
        readVal();
      } while (skip(','));
      expect('}');
    }
  }

  function expect(str) {
    if (kind === str) {
      return lex();
    }
    throw syntaxError('Expected ' + str + ' but got ' + string.slice(start, end) + '.');
  }

  function readArr() {
    expect('[');
    if (!skip(']')) {
      do {
        readVal();
      } while (skip(','));
      expect(']');
    }
  }

  function readVal() {
    switch (kind) {
      case '[':
        return readArr();
      case '{':
        return readObj();
      case 'String':
        return lex();
      default:
        return expect('Value');
    }
  }
}).toString().split('\n').slice(1, -1).join('\n');

transform(code, {
  plugins: [
    function (b) {
      var t = b.types;
      return {
        visitor: {
          BinaryExpression: function(path) {
            path.get("left").baseTypeStrictlyMatches(path.get("right"));
          }
        }
      }
    }
  ],
  configFile: false,
});
