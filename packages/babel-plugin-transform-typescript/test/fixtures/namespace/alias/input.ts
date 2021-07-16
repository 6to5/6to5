declare module LongNameModule {
  export type SomeType = number;
  export const foo: number;
  module Inner {
    export type T = string;
    export const bar: boolean;
  }
}

import * as babel from '@babel/core';

/** type only */
import b = babel;
import AliasModule = LongNameModule;

const some: AliasModule.SomeType = 3;
const bar = AliasModule.foo;
const baz = AliasModule.Inner.bar;
let str: LongNameModule.Inner.T;
let node: b.OptionManager;

console.log(some);
