"use strict";

var _obj;

function _set(object, property, value, receiver) { var base = _superPropBase(object, property); var desc; if (base) { desc = Object.getOwnPropertyDescriptor(base, property); if (desc.set) { desc.set.call(receiver, value); return value; } else if (desc.get) { base[property] = value; } } desc = Object.getOwnPropertyDescriptor(receiver, property); if (desc) { if (!("value" in desc) || !desc.writable) { throw new Error("cannot redefine property"); } return receiver[property] = value; } Object.defineProperty(receiver, property, { value: value, writable: true, configurable: true, enumerable: true }); return value; }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.getPrototypeOf || function _getPrototypeOf(o) { return o.__proto__; }; return _getPrototypeOf(o); }

const Base = {};
const obj = _obj = {
  set() {
    return _set(_getPrototypeOf(_obj), "test", 3, this);
  }

};
Object.defineProperty(obj, 'test', {
  value: 2,
  writable: true,
  configurable: false
});
Object.setPrototypeOf(obj, Base);
assert.equal(obj.set(), 3);
assert.equal(Base.test, undefined);
assert.equal(obj.test, 3);
const desc = Object.getOwnPropertyDescriptor(obj, 'test');
assert.equal(desc.configurable, false);
assert.equal(desc.writable, true);
