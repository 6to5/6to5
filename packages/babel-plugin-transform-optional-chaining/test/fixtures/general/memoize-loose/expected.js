function test(foo) {
  var _foo$bar, _foo$bar2, _foo$bar3, _foo$bar4, _foo$bar5;

  foo == null ? void 0 : foo.bar;
  foo == null ? void 0 : (_foo$bar = foo.bar) == null ? void 0 : _foo$bar.baz;
  foo == null ? void 0 : foo(foo);
  foo == null ? void 0 : foo.bar();
  foo.bar == null ? void 0 : foo.bar(foo.bar, false);
  foo == null ? void 0 : foo.bar == null ? void 0 : foo.bar(foo.bar, true);
  (_foo$bar2 = foo.bar) == null ? void 0 : _foo$bar2.baz(foo.bar, false);
  foo == null ? void 0 : (_foo$bar3 = foo.bar) == null ? void 0 : _foo$bar3.baz(foo.bar, true);
  (_foo$bar4 = foo.bar) == null ? void 0 : _foo$bar4.baz == null ? void 0 : _foo$bar4.baz(foo.bar, false);
  foo == null ? void 0 : (_foo$bar5 = foo.bar) == null ? void 0 : _foo$bar5.baz == null ? void 0 : _foo$bar5.baz(foo.bar, true);
}
