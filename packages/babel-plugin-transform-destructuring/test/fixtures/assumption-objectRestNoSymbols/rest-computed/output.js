let _obj = obj,
    _a = babelHelpers.toPropertyKey(a),
    b = _obj[_a],
    c = babelHelpers.objectWithoutPropertiesLoose(_obj, [_a]);
