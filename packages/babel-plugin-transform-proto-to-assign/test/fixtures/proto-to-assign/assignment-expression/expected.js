var _foo, _foo$bar, _foo$bar2;

console.log((_foo = foo, babelHelpers.defaults(_foo, bar), _foo));
console.log((_foo$bar = foo[bar], babelHelpers.defaults(_foo$bar, bar), _foo$bar));
console.log((_foo$bar2 = foo[bar()], babelHelpers.defaults(_foo$bar2, bar), _foo$bar2));