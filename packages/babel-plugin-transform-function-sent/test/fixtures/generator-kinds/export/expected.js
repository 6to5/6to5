function _skipFirstGeneratorNext(fn) { return function (...args) { const it = fn.apply(this, args); it.next(); return it; }; }

export let gen = (() => {
  var _ref = _skipFirstGeneratorNext(function* () {
    let _functionSent = yield;

    return _functionSent;
  });

  return function gen() {
    return _ref.apply(this, arguments);
  };
})();
