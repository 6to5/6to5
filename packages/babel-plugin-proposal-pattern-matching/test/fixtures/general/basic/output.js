let _case = input,
    x,
    a,
    b;
if (Object.is(_case) && (_x = _case.x, typeof _x !== "undefined")) console.log('object', _x);else if (Array.isArray(_case) && _case[0] === 1 && (_a = _case[1], typeof _a !== "undefined") && (_b = _case[2], typeof _b !== "undefined")) console.log('array', _a, _b);
