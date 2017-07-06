const x = function x() {
  return x;
};

const y = function y(x) {
  return x();
};

const z = {
  z: function z() {
    return y(x);
  }
}.z;