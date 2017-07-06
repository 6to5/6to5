var _this = this;

// These are actually handled by transform-es2015-arrow-function
const x = function x() {
  babelHelpers.newArrowCheck(this, _this);
  return x;
}.bind(this);

const y = function y(x) {
  babelHelpers.newArrowCheck(this, _this);
  return x();
}.bind(this);

const z = {
  z: function z() {
    babelHelpers.newArrowCheck(this, _this);
    return y(x);
  }.bind(this)
}.z;