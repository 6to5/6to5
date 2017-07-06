function test(foo) {
  foo?.bar;

  foo?.bar?.baz;

  foo?.(foo);

  foo?.bar()

  foo.bar?.(foo.bar, false)

  foo?.bar?.(foo.bar, true)

  foo.bar?.baz(foo.bar, false)

  foo?.bar?.baz(foo.bar, true)

  foo.bar?.baz?.(foo.bar, false)

  foo?.bar?.baz?.(foo.bar, true)
}
