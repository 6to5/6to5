"use strict";

var _obj;

function _set(object, property, value, receiver) { var base = _superPropBase(object, property); var desc; if (base) { desc = Object.getOwnPropertyDescriptor(base, property); if (desc.set) { desc.set.call(receiver, value); return value; } else if (desc.get || !desc.writable) { return base[property] = value; } } desc = Object.getOwnPropertyDescriptor(receiver, property); if (desc) { if (desc.set) { if (_isStrict()) { throw new Error("cannot redefine property"); } return value; } else { return receiver[property] = value; } } _defineProperty(receiver, property, value); return value; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _isStrict() { var strict = false; try { var obj = { get test() {} }; obj.test = 1; } catch (e) { strict = true; } _isStrict = function () { return strict; }; return strict; }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.getPrototypeOf || function _getPrototypeOf(o) { return o.__proto__; }; return _getPrototypeOf(o); }

let value = 1;
const Base = {
  set test(v) {
    value = v;
  }

};
const obj = _obj = {
  test: 2,

  set() {
    return _set(_getPrototypeOf(_obj), "test", 3, this);
  }

};
Object.setPrototypeOf(obj, Base);
assert.equal(obj.set(), 3);
assert.equal(value, 3);
assert.equal(Base.test, undefined);
assert.equal(obj.test, 2);
