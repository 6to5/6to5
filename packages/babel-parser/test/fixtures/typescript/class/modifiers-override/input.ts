class MyClass extends BaseClass {
  override show() {}
  override public show() {}
  public override show() {}
  override size = 5;
  override readonly size = 5;
  readonly override size = 5;

  override get text() {}
  override set text(value) {}

  override async fetch() {}
}

declare class DeclaredClass extends BaseClass {
  override test() {}
}
