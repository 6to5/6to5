var input = {};

var _ref = prefix + 'state',
    _ref2 = `${prefix}consents`,
    givenName = input.given_name,
    lastName = input['last_name'],
    country = input[`country`],
    state = input[_ref],
    consents = input[_ref2],
    rest = babelHelpers.objectWithoutProperties(input, ["given_name", "last_name", `country`, _ref, _ref2]);
