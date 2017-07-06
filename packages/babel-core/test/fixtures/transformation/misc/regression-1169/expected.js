function foo() {
  var input = ['a', 'b', 'c'];
  var output = {};

  for (var _i = 0; _i < input.length; _i++) {
    var c = input[_i];
    var name = c;
    output[name] = name;
  }

  return output;
}
