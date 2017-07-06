class Foo extends class {} {
  method() {
    var _superprop_callMethod = (..._args) => super.method(..._args);

    return babelHelpers.asyncToGenerator(function* () {
      _superprop_callMethod();

      var arrow = () => _superprop_callMethod();
    })();
  }

}