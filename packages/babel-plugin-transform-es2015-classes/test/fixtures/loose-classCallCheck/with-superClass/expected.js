function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

let B = function B() {};

let A = function (_B) {
  _inheritsLoose(A, _B);

  function A(track) {
    if (track !== undefined) {
      var _this = _B.call(this, track) || this;
    } else {
      var _this = _B.call(this) || this;
    }

    return _this;
  }

  return A;
}(B);
