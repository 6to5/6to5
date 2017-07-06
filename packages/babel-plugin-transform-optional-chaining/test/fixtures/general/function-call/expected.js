var _foo, _foo2, _foo$bar, _foo3, _foo4, _foo4$bar, _foo5, _foo6, _foo7, _foo$bar2, _foo8, _foo$bar3, _foo9, _foo$bar3$call, _foo10, _foo10$bar, _foo11, _foo11$bar, _foo11$bar$call;

(_foo = foo) == null ? void 0 : _foo(foo);
(_foo2 = foo) == null ? void 0 : _foo2.bar();
(_foo$bar = (_foo3 = foo).bar) == null ? void 0 : _foo$bar.call(_foo3, foo.bar, false);
(_foo4 = foo) == null ? void 0 : (_foo4$bar = _foo4.bar) == null ? void 0 : _foo4$bar.call(_foo4, foo.bar, true);
(_foo5 = foo) == null ? void 0 : _foo5().bar;
(_foo6 = foo) == null ? void 0 : (_foo7 = _foo6()) == null ? void 0 : _foo7.bar;
(_foo$bar2 = (_foo8 = foo).bar) == null ? void 0 : _foo$bar2.call(_foo8).baz;
(_foo$bar3 = (_foo9 = foo).bar) == null ? void 0 : (_foo$bar3$call = _foo$bar3.call(_foo9)) == null ? void 0 : _foo$bar3$call.baz;
(_foo10 = foo) == null ? void 0 : (_foo10$bar = _foo10.bar) == null ? void 0 : _foo10$bar.call(_foo10).baz;
(_foo11 = foo) == null ? void 0 : (_foo11$bar = _foo11.bar) == null ? void 0 : (_foo11$bar$call = _foo11$bar.call(_foo11)) == null ? void 0 : _foo11$bar$call.baz;
