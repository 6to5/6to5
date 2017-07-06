let foo = (() => {
  var _ref = _asyncToGenerator(function* () {
    let bar = (() => {
      var _ref2 = _asyncToGenerator(function* () {
        return Promise.resolve();
      });

      return function bar() {
        return _ref2.apply(this, arguments);
      };
    })();

    let Promise;
    yield bar();
  });

  return function foo() {
    return _ref.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { return new Promise((resolve, reject) => { var gen = fn.apply(this, arguments); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

let _Promise;