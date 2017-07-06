function fn(Component, obj) {
  var data = obj.data,
      _ref = <Component prop={data} />;

  return () => _ref;
}