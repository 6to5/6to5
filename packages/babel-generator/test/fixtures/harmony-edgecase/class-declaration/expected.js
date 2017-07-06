class Test {}

class Derived extends Super {}

class StaticMethods {
  static n1() {}

  static get get1() {}

  static set set1(value) {}

  static *gen1() {}

}

class Methods {
  n2() {}

  get get2() {}

  set set2(value) {}

  *gen1() {}

}

class ComputedStaticMethods {
  static [n1]() {}

  static get [get1]() {}

  static set [set1](value) {}

  static *[gen1]() {}

}

class ComputedMethods {
  [n2]() {}

  get [get2]() {}

  set [set2](value) {}

  *[gen1]() {}

}