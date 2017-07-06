var _this = this;

[].map(function (x) {
  babelHelpers.newArrowCheck(this, _this);
  return x;
}.bind(this));

const f = function f(x) {
  babelHelpers.newArrowCheck(this, _this);
  return x;
}.bind(this);

const o = {
  k: function k(x) {
    babelHelpers.newArrowCheck(this, _this);
    return x;
  }.bind(this)
};