"use strict";

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var B = function B() {
  _classCallCheck(this, B);
};

var A = function (_B) {
  _inherits(A, _B);

  function A(track) {
    _classCallCheck(this, A);

    if (track !== undefined) {
      var _this = _possibleConstructorReturn(this, (A.__proto__ || Object.getPrototypeOf(A)).call(this, track));
    } else {
      var _this = _possibleConstructorReturn(this, (A.__proto__ || Object.getPrototypeOf(A)).call(this));
    }

    return _possibleConstructorReturn(_this);
  }

  return A;
}(B);