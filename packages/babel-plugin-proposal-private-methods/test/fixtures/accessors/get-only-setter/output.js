var _privateField = new WeakMap();

var _privateFieldValue = new WeakMap();

class Cl {
  constructor() {
    _privateFieldValue.set(this, {
      get: void 0,
      set: _set_privateFieldValue
    });

    _privateField.set(this, {
      writable: true,
      value: 0
    });

    this.publicField = (this, babelHelpers.writeOnlyError("#privateFieldValue"));
  }

}

var _set_privateFieldValue = function (newValue) {
  babelHelpers.classPrivateFieldSet(this, _privateField, newValue);
};
