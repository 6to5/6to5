"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var _onClick = _ref.onClick;
  return React.createElement("div", {
    onClick: function onClick() {
      return _onClick();
    }
  });
};