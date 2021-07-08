var _ref;

const program = '(function() { return this; })()';
const result = (_ref = program, eval(_ref));
expect(result).not.toBeUndefined();
