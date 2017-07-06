function foo(numVal: any) {}

function foo(numVal: number) {}

function foo(numVal: number, strVal: string) {}

function foo(numVal: number, untypedVal) {}

function foo(untypedVal, numVal: number) {}

function foo(nullableNum: ?number) {}

function foo(callback: () => void) {}

function foo(callback: () => number) {}

function foo(callback: (_: boolean) => number) {}

function foo(callback: (_1: boolean, _2: string) => number) {}

function foo(callback: (_1: boolean, ...foo: Array<number>) => number) {}

function foo(): number {}

function foo(): () => void {}

function foo(): (_: boolean) => number {}

function foo(): (_?: boolean) => number {}

function foo(): {} {}

function foo<T>() {}

function foo<T, S>() {}

function foo<T: F>() {}

a = function <T, S>() {};

a = {
  set fooProp(value: number) {}

};
a = {
  set fooProp(value: number): void {}

};
a = {
  get fooProp(): number {}

};
a = {
  id<T>(x: T): T {}

};
a = {
  *id<T>(x: T): T {}

};
a = {
  async id<T>(x: T): T {}

};
a = {
  123<T>(x: T): T {}

};

class Foo {
  set fooProp(value: number) {}

}

class Foo {
  set fooProp(value: number): void {}

}

class Foo {
  get fooProp(): number {}

}

var numVal: number;
var numVal: empty;
var numVal: mixed;
var numVal: number = otherNumVal;
var a: {
  numVal: number
};
var a: {
  numVal: number
};
var a: {
  numVal: number,
  [indexer: string]: number,
};
var a: ?{
  numVal: number
};
var a: {
  numVal: number,
  strVal: string,
};
var a: {
  subObj: {
    strVal: string
  }
};
var a: {
  subObj: ?{
    strVal: string
  }
};
var a: {
  param1: number,
  param2: string,
};
var a: {
  param1: number,
  param2?: string,
};
var a: {
  [a: number]: string,
  [b: number]: string,
};
var a: {
  add: (x: number, ...y: Array<string>) => void
};
var a: {
  subtract: (x: number, ...y: Array<string>) => void
};
var a: {
  id: <T>(x: T) => T
};
var a: Array<number> = [1, 2, 3];
a = class Foo<T> {};
a = class Foo<T> extends Bar<T> {};

class Foo<T> {}

class Foo<T> extends Bar<T> {}

class Foo<T> extends mixin(Bar) {}

class Foo<T> {
  bar<U>(): number {
    return 42;
  }

}

class Foo {
  "bar"<T>() {}

}

function foo(requiredParam, optParam?) {}

class Foo {
  prop1: string;
  prop2: number;
}

class Foo {
  static prop1: string;
  prop2: number;
}

var x: number | string = 4;

class Array {
  concat(items: number | string) {}

}

var x: () => number | () => string = fn;
var x: typeof Y = Y;
var x: typeof Y | number = Y;
var {
  x
}: {
  x: string
} = {
  x: "hello"
};
var {
  x
}: {
  x: string
} = {
  x: "hello"
};
var [x]: Array<string> = ["hello"];

function foo({
  x
}: {
  x: string
}) {}

function foo([x]: Array<string>) {}

function foo(...rest: Array<number>) {}

(function (...rest: Array<number>) {});

(...rest: Array<number>) => rest;

var a: Map<string, Array<string>>;
var a: Map<string, Array<string>>;
var a: number[];
var a: ?string[];
var a: Promise<boolean>[];
var a: (...rest: Array<number>) => number;
var identity: <T>(x: T) => T;
var identity: <T>(x: T, ...y: T[]) => T;
import type foo from "bar";
import type { foo, bar } from "baz";
import type { foo as bar } from "baz";
import type from "foo";
import type, { foo } from "bar";
import type * as namespace from "bar";
import { type Foo } from "bar";
import { typeof Foo } from "bar";
import { type Foo as Bar } from "bar";
import { typeof Foo as Bar } from "bar";
export type { foo };
export type { bar } from "bar";
export interface baz {
  p: number
}
export interface qux<T> {
  p: T
}
var a: ?Array<?string>;
var a: {|
  numVal: number
|};
var a: {|
  numVal: number
|};
var a: {|
  numVal: number,
  [indexer: string]: number,
|};
var a: ?{|
  numVal: number
|};
var a: {|
  numVal: number,
  strVal: string,
|};
var a: {|
  subObj: {
    strVal: string
  }
|};
var a: {|
  subObj: ?{
    strVal: string
  }
|};
var a: {|
  param1: number,
  param2: string,
|};
var a: {|
  param1: number,
  param2?: string,
|};
var a: {|
  [a: number]: string,
  [b: number]: string,
|};
var a: {|
  add: (x: number, ...y: Array<string>) => void
|};
var a: {|
  subtract: (x: number, ...y: Array<string>) => void
|};
var a: {|
  id: <T>(x: T) => T
|};

function foo(numVal: number = 2) {}

function foo(numVal?: number = 2) {}