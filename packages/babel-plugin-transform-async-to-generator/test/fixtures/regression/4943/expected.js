"use strict";

let foo = (() => {
  var _ref = _asyncToGenerator(function* (_ref2) {
    let a = _ref2.a,
        _ref2$b = _ref2.b,
        b = _ref2$b === undefined ? mandatory("b") : _ref2$b;
    return Promise.resolve(b);
  });

  return function foo(_x) {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { return new Promise((resolve, reject) => { var gen = fn.apply(this, arguments); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

function mandatory(paramName) {
  throw new Error(`Missing parameter: ${paramName}`);
}