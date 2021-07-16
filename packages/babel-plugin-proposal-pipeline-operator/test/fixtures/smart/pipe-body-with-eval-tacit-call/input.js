(function() {
  'use strict';
  var result = '(function() { return this; })()'
    |> eval;

  expect(result).not.toBeUndefined();
})();
