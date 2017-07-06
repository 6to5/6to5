// ExportNamedDeclaration
var {
  b
} = asdf2,
    c = babelHelpers.objectWithoutProperties(asdf2, ["b"]); // Skip

export { b, c };
export var {
  bb,
  cc
} = ads;
export var [dd, ee] = ads;