const program = '(function() { return this; })()';
const result = program |> eval(#);

expect(result).not.toBeUndefined();
