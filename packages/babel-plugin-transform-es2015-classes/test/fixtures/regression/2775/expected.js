"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _react = require("react");

var _react2 = babelHelpers.interopRequireDefault(_react);

var RandomComponent = function (_Component) {
  babelHelpers.inherits(RandomComponent, _Component);

  function RandomComponent() {
    babelHelpers.classCallCheck(this, RandomComponent);
    return babelHelpers.possibleConstructorReturn(this, (RandomComponent.__proto__ || Object.getPrototypeOf(RandomComponent)).call(this));
  }

  babelHelpers.createClass(RandomComponent, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        {
          className: "sui-RandomComponent"
        },
        _react2.default.createElement(
          "h2",
          null,
          "Hi there!"
        )
      );
    }
  }]);
  return RandomComponent;
}(_react.Component);

exports.default = RandomComponent;