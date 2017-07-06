function _asyncToGenerator(fn) { return function () { return new Promise((resolve, reject) => { var gen = fn.apply(this, arguments); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

export default {
  function(name) {
    return _asyncToGenerator(function* () {
      const uppercasedName = name.upperCase(); // awaits depending on uppercasedName go here

      return <Foo name={uppercasedName} />;
    })();
  }

};