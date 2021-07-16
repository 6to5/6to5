var obj = {
  @foo
  @bar
  foo: "bar",

  @foo
  @bar
  foo() {},

  @foo
  get foo() {},

  @bar
  set bar(foo) {}

};

class Foo {
  @foo
  @bar
  foo() {}

  @foo
  @bar
  foo() {}

  @foo
  get foo() {}

  @bar
  set bar(foo) {}

}

export default @foo
class Foo2 {
  bar() {
    class Baz {}
  }

}
export @foo
class Foo3 {
  bar() {
    class Baz {}
  }

}