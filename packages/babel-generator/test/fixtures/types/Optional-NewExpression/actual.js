new foo?.();
new foo?.("foo");
new foo?.("foo", "bar");
new foo?.(bar());
new foo?.(bar("test"));
foo(new bar?.());
foo(new bar?.("test"));

new a.foo?.();
new a.foo?.("foo");
new a.foo?.("foo", "bar");
new a.foo?.(bar());
new a.foo?.(bar("test"));
a.foo(new bar?.());
a.foo(new bar?.("test"));

new a?.foo?.();
new a?.foo?.("foo");
new a?.foo?.("foo", "bar");
new a?.foo?.(bar());
new a?.foo?.(bar("test"));
a?.foo(new bar?.());
a?.foo(new bar?.("test"));

new a.foo?.().baz;
new a.foo?.("foo").baz;
new a.foo?.("foo", "bar").baz;
new a.foo?.(bar()).baz;
new a.foo?.(bar("test")).baz;
a.foo(new bar?.()).baz;
a.foo(new bar?.("test")).baz;

new a.foo?.()?.baz;
new a.foo?.("foo")?.baz;
new a.foo?.("foo", "bar")?.baz;
new a.foo?.(bar())?.baz;
new a.foo?.(bar("test"))?.baz;
a.foo(new bar?.())?.baz;
a.foo(new bar?.("test"))?.baz;
