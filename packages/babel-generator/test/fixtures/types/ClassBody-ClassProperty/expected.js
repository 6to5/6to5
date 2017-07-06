class Foo {
  foo;
  foo = 1;
  "foo";
  "foo" = 1;
  foo = super.foo();
  ["foo"];
  ["foo"] = 1;
  ["f" + "oo"];
  ["f" + "oo"] = 1;
  static foo;
  static foo = 1;
  static "foo";
  static "foo" = 1;
  static foo = super.foo();
  static ["foo"];
  static ["foo"] = 1;
  static ["f" + "oo"];
  static ["f" + "oo"] = 1;
  get;
  set;
  static;
  static = 1;
  async;
  foo;
  bar;
  foo = 0;
  bar = 1;
}

class A1 {
  static a;
  static;
}

class A2 {
  get;

  *a() {}

}

class A3 {
  static *a() {}

}

class A4 {
  async;

  a() {}

}

class A5 {
  static async;
  a;
}

class A6 {
  get ['a']() {}

}

class A7 {
  static get static() {}

}