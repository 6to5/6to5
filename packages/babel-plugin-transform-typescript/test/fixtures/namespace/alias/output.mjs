import * as babel from '@babel/core';
/** type only */

var b = babel;
var AliasModule = LongNameModule;
const some = 3;
const bar = AliasModule.foo;
const baz = AliasModule.Inner.bar;
let str;
let node;
console.log(some);
