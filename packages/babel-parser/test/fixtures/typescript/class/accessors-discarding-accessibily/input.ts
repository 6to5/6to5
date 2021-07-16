class C {
  public get bar() {}
  set bar(v) {}

  public get foo() {}
  private set foo(v) {}

  protected get [Symbol.iterator]() {}
  private set [Symbol.iterator](v) {}

  public get [baz()]() {}
  private set [baz()](v) {}
}
