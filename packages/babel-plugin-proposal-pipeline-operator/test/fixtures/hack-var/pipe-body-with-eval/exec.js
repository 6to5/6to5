const program = '(function() { return this; })()';
const result = program |> eval(var);

expect(result).not.toBeUndefined();
