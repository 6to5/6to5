let A = function A() {
  console.log('a');
};

let B = function () {
  function B() {}

  B.prototype.b = function b() {
    console.log('b');
  };

  return B;
}();