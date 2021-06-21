class A extends B {
  #foo;
  #bar = 1;

  constructor() {
    doStuff();
    super();
    doOtherStuff(() => super());
  }
}
