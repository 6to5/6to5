var Cl = function Cl() {
  "use strict";

  babelHelpers.classCallCheck(this, Cl);

  _privateField.set(this, {
    writable: true,
    value: 0
  });

  _getSet.set(this, {
    get: _get_getSet,
    set: _set_getSet
  });
};

var _privateField = new WeakMap();

var _getSet = new WeakMap();

var _get_getSet = function () {
  return babelHelpers.classPrivateFieldGet(this, _privateField);
};

var _set_getSet = function (newValue) {
  babelHelpers.classPrivateFieldSet(this, _privateField, newValue);
};
