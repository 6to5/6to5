var _program;

const program = '(function() { return this; })()';
const result = (_program = program, eval(_program));
expect(result).not.toBeUndefined();
