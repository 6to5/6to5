var _templateObject = _taggedTemplateLiteral([void 0], ["\\unicode and \\u{55}"]),
    _templateObject2 = _taggedTemplateLiteral([void 0], ["\\01"]),
    _templateObject3 = _taggedTemplateLiteral([void 0, "right"], ["\\xg", "right"]),
    _templateObject4 = _taggedTemplateLiteral(["left", void 0], ["left", "\\xg"]),
    _templateObject5 = _taggedTemplateLiteral(["left", void 0, "right"], ["left", "\\xg", "right"]),
    _templateObject6 = _taggedTemplateLiteral(["left", void 0, "right"], ["left", "\\u000g", "right"]),
    _templateObject7 = _taggedTemplateLiteral(["left", void 0, "right"], ["left", "\\u{-0}", "right"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

tag(_templateObject);
tag(_templateObject2);
tag(_templateObject3, 0);
tag(_templateObject4, 0);
tag(_templateObject5, 0, 1);
tag(_templateObject6, 0, 1);
tag(_templateObject7, 0, 1);

function a() {
  var undefined = 4;
  tag(_templateObject2);
}