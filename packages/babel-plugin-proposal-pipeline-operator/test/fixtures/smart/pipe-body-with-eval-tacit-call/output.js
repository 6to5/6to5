(function () {
  'use strict';

  var _functionReturn;

  var result = (_functionReturn = '(function() { return this; })()', (0, eval)(_functionReturn));
  expect(result).not.toBeUndefined();
})();
