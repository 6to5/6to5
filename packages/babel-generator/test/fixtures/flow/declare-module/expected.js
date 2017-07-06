declare module A {}
declare module "./a/b.js" {}
declare module A {
  declare var x: number;
}
declare module A {
  declare function foo(): number;
}
declare module A {
  declare class B {
    foo: () => number
  }
}
declare module A {
  declare module.exports: {
    foo: () => number
  }
}