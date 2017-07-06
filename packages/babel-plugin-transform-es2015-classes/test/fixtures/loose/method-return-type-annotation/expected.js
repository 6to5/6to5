// @flow
var C = function () {
  function C() {}

  C.prototype.m = function m(x: number): string {
    return 'a';
  };

  return C;
}();
