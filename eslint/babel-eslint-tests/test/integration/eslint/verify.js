import verifyAndAssertMessages from "../../helpers/verifyAndAssertMessages";
import path from "path";
import { fileURLToPath } from "url";

describe("verify", () => {
  it("arrow function support (issue #1)", () => {
    verifyAndAssertMessages("describe('stuff', () => {});");
  });

  it("EOL validation (issue #2)", () => {
    verifyAndAssertMessages(
      'module.exports = "something";',
      { "eol-last": 1, semi: 1 },
      ["1:30 Newline required at end of file but not found. eol-last"],
    );
  });

  it("Readable error messages (issue #3)", () => {
    verifyAndAssertMessages("{ , res }", {}, [
      /1:2 Parsing error:.*Unexpected token \(1:2\)/,
    ]);
  });

  it("Modules support (issue #5)", () => {
    verifyAndAssertMessages(
      `
        import Foo from 'foo';
        export default Foo;
        export const c = 'c';
        export class Store {}
      `,
    );
  });

  it("Rest parameters (issue #7)", () => {
    verifyAndAssertMessages("function foo(...args) { return args; }", {
      "no-undef": 1,
    });
  });

  it("Exported classes should be used (issue #8)", () => {
    verifyAndAssertMessages("class Foo {} module.exports = Foo;", {
      "no-unused-vars": 1,
    });
  });

  it("super keyword in class (issue #10)", () => {
    verifyAndAssertMessages("class Foo { constructor() { super() } }", {
      "no-undef": 1,
    });
  });

  it("Rest parameter in destructuring assignment (issue #11)", () => {
    verifyAndAssertMessages(
      "const [a, ...rest] = ['1', '2', '3']; module.exports = rest;",
      { "no-undef": 1 },
    );
  });

  it("JSX attribute names marked as variables (issue #12)", () => {
    verifyAndAssertMessages('module.exports = <div className="foo" />', {
      "no-undef": 1,
    });
  });

  it("Multiple destructured assignment with compound properties (issue #16)", () => {
    verifyAndAssertMessages("module.exports = { ...a.a, ...a.b };", {
      "no-dupe-keys": 1,
    });
  });

  it("Arrow function with non-block bodies (issue #20)", () => {
    verifyAndAssertMessages(
      '"use strict"; () => 1',
      { strict: [1, "global"] },
      [],
      "script",
      { sourceType: "script" },
    );
  });

  it("#242", () => {
    verifyAndAssertMessages('"use strict"; asdf;', {
      "no-irregular-whitespace": 1,
    });
  });

  it("await keyword (issue #22)", () => {
    verifyAndAssertMessages("async function foo() { await bar(); }", {
      "no-unused-expressions": 1,
    });
  });

  it("arrow functions (issue #27)", () => {
    verifyAndAssertMessages("[1, 2, 3].map(i => i * 2);", {
      "func-names": 1,
      "space-before-blocks": 1,
    });
  });

  it("comment with padded-blocks (issue #33)", () => {
    verifyAndAssertMessages(
      `
        if (a) {
          // i'm a comment!
          let b = c
        }
      `,
      { "padded-blocks": [1, "never"] },
    );
  });

  describe("flow", () => {
    it("check regular function", () => {
      verifyAndAssertMessages(
        "function a(b, c) { b += 1; c += 1; return b + c; } a;",
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("type alias", () => {
      verifyAndAssertMessages("type SomeNewType = any;", { "no-undef": 1 });
    });

    it("type cast expression #102", () => {
      verifyAndAssertMessages("for (let a of (a: Array)) {}");
    });

    it("multiple nullable type annotations and return #108", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          import type Foo3 from 'foo';
          function log(foo: ?Foo, foo2: ?Foo2): ?Foo3 {
            console.log(foo, foo2);
          }
          log(1, 2);
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("interface declaration", () => {
      verifyAndAssertMessages(
        `
          interface Foo {};
          interface Bar {
            foo: Foo,
          };
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
        ["2:11 'Bar' is defined but never used. no-unused-vars"],
      );
    });

    it("type parameter bounds (classes)", () => {
      verifyAndAssertMessages(
        `
          import type {Foo, Foo2} from 'foo';
          import Base from 'base';
          class Log<T1: Foo, T2: Foo2, T3, T4> extends Base<T3> {
            messages: {[T1]: T2};
          }
          new Log();
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
        ["3:34 'T4' is defined but never used. no-unused-vars"],
      );
    });

    it("type parameter scope (classes)", () => {
      verifyAndAssertMessages(
        `
          T;
          class Foo<T> {}
          T;
          new Foo();
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
        [
          "1:1 'T' is not defined. no-undef",
          "2:11 'T' is defined but never used. no-unused-vars",
          "3:1 'T' is not defined. no-undef",
        ],
      );
    });

    it("type parameter bounds (interfaces)", () => {
      verifyAndAssertMessages(
        `
          import type {Foo, Foo2, Bar} from '';
          interface Log<T1: Foo, T2: Foo2, T3, T4> extends Bar<T3> {
            messages: {[T1]: T2};
          }
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
        [
          "2:11 'Log' is defined but never used. no-unused-vars",
          "2:38 'T4' is defined but never used. no-unused-vars",
        ],
      );
    });

    it("type parameter scope (interfaces)", () => {
      verifyAndAssertMessages(
        `
          T;
          interface Foo<T> {};
          T;
          Foo;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
        [
          "1:1 'T' is not defined. no-undef",
          "2:15 'T' is defined but never used. no-unused-vars",
          "3:1 'T' is not defined. no-undef",
        ],
      );
    });

    it("type parameter bounds (type aliases)", () => {
      verifyAndAssertMessages(
        `
          import type {Foo, Foo2, Foo3} from 'foo';
          type Log<T1: Foo, T2: Foo2, T3> = {
            messages: {[T1]: T2};
            delay: Foo3;
          };
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
        [
          "2:6 'Log' is defined but never used. no-unused-vars",
          "2:29 'T3' is defined but never used. no-unused-vars",
        ],
      );
    });

    it("type parameter scope (type aliases)", () => {
      verifyAndAssertMessages(
        `
          T;
          type Foo<T> = {};
          T;
          Foo;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
        [
          "1:1 'T' is not defined. no-undef",
          "2:10 'T' is defined but never used. no-unused-vars",
          "3:1 'T' is not defined. no-undef",
        ],
      );
    });

    it("type parameter bounds (functions)", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          function log<T1: Foo, T2: Foo2, T3, T4>(a: T1, b: T2): T3 { return a + b; }
          log(1, 2);
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
        ["3:37 'T4' is defined but never used. no-unused-vars"],
      );
    });

    it("type parameter scope (functions)", () => {
      verifyAndAssertMessages(
        `
          T;
          function log<T>() {}
          T;
          log;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
        [
          "1:1 'T' is not defined. no-undef",
          "2:14 'T' is defined but never used. no-unused-vars",
          "3:1 'T' is not defined. no-undef",
        ],
      );
    });

    it("nested type annotations", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          function foo(callback: () => Foo) {
            return callback();
          }
          foo();
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("type in var declaration", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var x: Foo = 1;
          x;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("object type annotation", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var a: {numVal: Foo};
          a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("object property types", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          var a = {
            circle: (null : ?{ setNativeProps(props: Foo): Foo2 })
          };
          a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("namespaced types", () => {
      verifyAndAssertMessages(
        `
          var React = require('react-native');
          var b = {
            openExternalExample: (null: ?React.Component)
          };
          var c = {
            render(): React.Component {}
          };
          b;
          c;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("ArrayTypeAnnotation", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var x: Foo[]; x;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("ClassImplements", () => {
      verifyAndAssertMessages(
        `
          import type Bar from 'foo';
          export default class Foo implements Bar {}
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("type alias creates declaration + usage", () => {
      verifyAndAssertMessages(
        `
          type Foo = any;
          var x : Foo = 1; x;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("type alias with type parameters", () => {
      verifyAndAssertMessages(
        `
          import type Bar from 'foo';
          import type Foo3 from 'foo';
          type Foo<T> = Bar<T, Foo3>
          var x : Foo = 1; x;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("export type alias", () => {
      verifyAndAssertMessages(
        `
          import type Foo2 from 'foo';
          export type Foo = Foo2;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("polymorphic types #109", () => {
      verifyAndAssertMessages(
        "export default function groupByEveryN<T>(array: Array<T>, n: number): Array<Array<?T>> { n; }",
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("types definition from import", () => {
      verifyAndAssertMessages(
        `
          import type Promise from 'bluebird';
          type Operation = () => Promise;
          x: Operation;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("polymorphic/generic types for class #123", () => {
      verifyAndAssertMessages(
        `
          class Box<T> {
            value: T;
          }
          var box = new Box();
          console.log(box.value);
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("polymorphic/generic types for function #123", () => {
      verifyAndAssertMessages(
        `
          export function identity<T>(value) {
            var a: T = value; a;
          }
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("polymorphic/generic types for type alias #123", () => {
      verifyAndAssertMessages(
        `
          import Bar from './Bar';
          type Foo<T> = Bar<T>; var x: Foo = 1; console.log(x);
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("polymorphic/generic types - outside of fn scope #123", () => {
      verifyAndAssertMessages(
        `
          export function foo<T>(value) { value; };
          var b: T = 1; b;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
        [
          "1:21 'T' is defined but never used. no-unused-vars",
          "2:8 'T' is not defined. no-undef",
        ],
      );
    });

    it("polymorphic/generic types - extending unknown #123", () => {
      verifyAndAssertMessages(
        `
          import Bar from 'bar';
          export class Foo extends Bar<T> {}
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
        ["2:30 'T' is not defined. no-undef"],
      );
    });

    it("polymorphic/generic types - function calls", () => {
      verifyAndAssertMessages(
        `
          function f<T>(): T {}
          f<T>();
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
        ["2:3 'T' is not defined. no-undef"],
      );
    });

    it("polymorphic/generic types - function calls #644", () => {
      verifyAndAssertMessages(
        `
          import type {Type} from 'Type';
          function f<T>(): T {}
          f<Type>();
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("support declarations #132", () => {
      verifyAndAssertMessages(
        `
          declare class A { static () : number }
          declare module B { declare var x: number; }
          declare function foo<T>(): void;
          declare var bar
          A; B; foo(); bar;
        `,
        { "no-undef": 1, "no-unused-vars": 1 },
      );
    });

    it("supports type spreading", () => {
      verifyAndAssertMessages(
        `
          type U = {};
          type T = {a: number, ...U, ...V};
        `,
        { "no-undef": 1, "no-unused-vars": 1 },
        [
          "2:6 'T' is defined but never used. no-unused-vars",
          "2:31 'V' is not defined. no-undef",
        ],
      );
    });

    it("1", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          export default function(a: Foo, b: ?Foo2, c){ a; b; c; }
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("2", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          export default function(a: () => Foo){ a; }
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("3", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          export default function(a: (_:Foo) => Foo2){ a; }
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("4", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          import type Foo3 from 'foo';
          export default function(a: (_1:Foo, _2:Foo2) => Foo3){ a; }
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("5", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          export default function(a: (_1:Foo, ...foo:Array<Foo2>) => number){ a; }
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("6", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          export default function(): Foo {}
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("7", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          export default function():() => Foo {}
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("8", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          export default function():(_?:Foo) => Foo2{}
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("9", () => {
      verifyAndAssertMessages(
        "export default function <T1, T2>(a: T1, b: T2) { b; }",
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("10", () => {
      verifyAndAssertMessages(
        "var a=function<T1,T2>(a: T1, b: T2) {return a + b;}; a;",
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("11", () => {
      verifyAndAssertMessages("var a={*id<T>(x: T): T { x; }}; a;", {
        "no-unused-vars": 1,
        "no-undef": 1,
      });
    });

    it("12", () => {
      verifyAndAssertMessages("var a={async id<T>(x: T): T { x; }}; a;", {
        "no-unused-vars": 1,
        "no-undef": 1,
      });
    });

    it("13", () => {
      verifyAndAssertMessages("var a={123<T>(x: T): T { x; }}; a;", {
        "no-unused-vars": 1,
        "no-undef": 1,
      });
    });

    it("14", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          export default class Bar {set fooProp(value:Foo):Foo2{ value; }}
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("15", () => {
      verifyAndAssertMessages(
        `
          import type Foo2 from 'foo';
          export default class Foo {get fooProp(): Foo2{}}
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("16", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var numVal:Foo; numVal;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("17", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var a: {numVal: Foo;}; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("18", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          import type Foo3 from 'foo';
          var a: ?{numVal: Foo; [indexer: Foo2]: Foo3}; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("19", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          var a: {numVal: Foo; subObj?: ?{strVal: Foo2}}; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("20", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          import type Foo3 from 'foo';
          import type Foo4 from 'foo';
          var a: { [a: Foo]: Foo2; [b: Foo3]: Foo4; }; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("21", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          import type Foo3 from 'foo';
          var a: {add(x:Foo, ...y:Array<Foo2>): Foo3}; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("22", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          import type Foo3 from 'foo';
          var a: { id<Foo>(x: Foo2): Foo3; }; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("23", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var a:Array<Foo> = [1, 2, 3]; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("24", () => {
      verifyAndAssertMessages(
        `
          import type Baz from 'baz';
          export default class Bar<T> extends Baz<T> { };
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("25", () => {
      verifyAndAssertMessages(
        "export default class Bar<T> { bar(): T { return 42; }}",
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("26", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          export default class Bar { static prop1:Foo; prop2:Foo2; }
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("27", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          var x : Foo | Foo2 = 4; x;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("28", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          var x : () => Foo | () => Foo2; x;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("29", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          var x: typeof Foo | number = Foo2; x;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("30", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var {x}: {x: Foo; } = { x: 'hello' }; x;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("31", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var [x]: Array<Foo> = [ 'hello' ]; x;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("32", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          export default function({x}: { x: Foo; }) { x; }
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("33", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          function foo([x]: Array<Foo>) { x; } foo();
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("34", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          var a: Map<Foo, Array<Foo2> >; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("35", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var a: ?Promise<Foo>[]; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("36", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          var a:(...rest:Array<Foo>) => Foo2; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("37", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          import type Foo3 from 'foo';
          import type Foo4 from 'foo';
          var a: <Foo>(x: Foo2, ...y:Foo3[]) => Foo4; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("38", () => {
      verifyAndAssertMessages(
        `
          import type {foo, bar} from 'baz';
          foo; bar;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("39", () => {
      verifyAndAssertMessages(
        `
          import type {foo as bar} from 'baz';
          bar;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("40", () => {
      verifyAndAssertMessages(
        `
          import type from 'foo';
          type;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("41", () => {
      verifyAndAssertMessages(
        `
          import type, {foo} from 'bar';
          type; foo;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("43", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var a: Foo[]; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("44", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var a: ?Foo[]; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("45", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var a: (?Foo)[]; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("46", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var a: () => Foo[]; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("47", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var a: (() => Foo)[]; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("48", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          var a: typeof Foo[]; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });

    it("49", () => {
      verifyAndAssertMessages(
        `
          import type Foo from 'foo';
          import type Foo2 from 'foo';
          import type Foo3 from 'foo';
          var a : [Foo, Foo2<Foo3>,] = [123, 'duck',]; a;
        `,
        { "no-unused-vars": 1, "no-undef": 1 },
      );
    });
  });

  it("class usage", () => {
    verifyAndAssertMessages("class Lol {} module.exports = Lol;", {
      "no-unused-vars": 1,
    });
  });

  it("class definition: gaearon/redux#24", () => {
    verifyAndAssertMessages(
      `
        export default function root(stores) {
        return DecoratedComponent => class ReduxRootDecorator {
        a() { DecoratedComponent; stores; }
        };
        }
      `,
      { "no-undef": 1, "no-unused-vars": 1 },
    );
  });

  it("class properties #71", () => {
    verifyAndAssertMessages("class Lol { foo = 'bar'; }", { "no-undef": 1 });
  });

  it("template strings #31", () => {
    verifyAndAssertMessages("console.log(`${a}, b`);", { "comma-spacing": 1 });
  });

  it("template with destructuring #31", () => {
    verifyAndAssertMessages(
      `
        module.exports = {
        render() {
        var {name} = this.props;
        return Math.max(null, \`Name: \${name}, Name: \${name}\`);
        }
        };
      `,
      { "comma-spacing": 1 },
    );
  });

  it("template with arrow returning template #603", () => {
    verifyAndAssertMessages(
      `
        var a = \`\${() => {
            \`\${''}\`
        }}\`;
      `,
      { indent: 1 },
      [],
    );
  });

  describe("decorators #72 (legacy)", () => {
    it("class declaration", () => {
      verifyAndAssertMessages(
        `
          import classDeclaration from 'decorator';
          import decoratorParameter from 'decorator';
          @classDeclaration((parameter) => parameter)
          @classDeclaration(decoratorParameter)
          @classDeclaration
          export class TextareaAutosize {}
        `,
        { "no-unused-vars": 1 },
      );
    });

    it("method definition", () => {
      verifyAndAssertMessages(
        `
          import classMethodDeclarationA from 'decorator';
          import decoratorParameter from 'decorator';
          export class TextareaAutosize {
          @classMethodDeclarationA((parameter) => parameter)
          @classMethodDeclarationA(decoratorParameter)
          @classMethodDeclarationA
          methodDeclaration(e) {
          e();
          }
          }
        `,
        { "no-unused-vars": 1 },
      );
    });

    it("method definition get/set", () => {
      verifyAndAssertMessages(
        `
          import classMethodDeclarationA from 'decorator';
          import decoratorParameter from 'decorator';
          export class TextareaAutosize {
          @classMethodDeclarationA((parameter) => parameter)
          @classMethodDeclarationA(decoratorParameter)
          @classMethodDeclarationA
          get bar() { }
          @classMethodDeclarationA((parameter) => parameter)
          @classMethodDeclarationA(decoratorParameter)
          @classMethodDeclarationA
          set bar(val) { val; }
          }
        `,
        { "no-unused-vars": 1 },
      );
    });

    it("object property", () => {
      verifyAndAssertMessages(
        `
          import classMethodDeclarationA from 'decorator';
          import decoratorParameter from 'decorator';
          var obj = {
          @classMethodDeclarationA((parameter) => parameter)
          @classMethodDeclarationA(decoratorParameter)
          @classMethodDeclarationA
          methodDeclaration(e) {
          e();
          }
          };
          obj;
        `,
        { "no-unused-vars": 1 },
      );
    });

    it("object property get/set", () => {
      verifyAndAssertMessages(
        `
          import classMethodDeclarationA from 'decorator';
          import decoratorParameter from 'decorator';
          var obj = {
          @classMethodDeclarationA((parameter) => parameter)
          @classMethodDeclarationA(decoratorParameter)
          @classMethodDeclarationA
          get bar() { },
          @classMethodDeclarationA((parameter) => parameter)
          @classMethodDeclarationA(decoratorParameter)
          @classMethodDeclarationA
          set bar(val) { val; }
          };
          obj;
        `,
        { "no-unused-vars": 1 },
      );
    });
  });

  if (!process.env.BABEL_8_BREAKING) {
    describe("decorators #72 (non-legacy)", () => {
      function verifyDecoratorsNonLegacyAndAssertMessages(
        code,
        rules,
        expectedMessages,
        sourceType,
      ) {
        const overrideConfig = {
          parserOptions: {
            sourceType,
            babelOptions: {
              configFile: path.resolve(
                path.dirname(fileURLToPath(import.meta.url)),
                "../../../../babel-eslint-shared-fixtures/config/babel.config.decorators-non-legacy.js",
              ),
            },
          },
        };
        return verifyAndAssertMessages(
          code,
          rules,
          expectedMessages,
          sourceType,
          overrideConfig,
        );
      }

      it("class declaration", () => {
        verifyDecoratorsNonLegacyAndAssertMessages(
          `
          import classDeclaration from 'decorator';
          import decoratorParameter from 'decorator';
          export
          @classDeclaration((parameter) => parameter)
          @classDeclaration(decoratorParameter)
          @classDeclaration
          class TextareaAutosize {}
        `,
          { "no-unused-vars": 1 },
        );
      });

      it("method definition", () => {
        verifyDecoratorsNonLegacyAndAssertMessages(
          `
          import classMethodDeclarationA from 'decorator';
          import decoratorParameter from 'decorator';
          export class TextareaAutosize {
          @classMethodDeclarationA((parameter) => parameter)
          @classMethodDeclarationA(decoratorParameter)
          @classMethodDeclarationA
          methodDeclaration(e) {
          e();
          }
          }
        `,
          { "no-unused-vars": 1 },
        );
      });

      it("method definition get/set", () => {
        verifyDecoratorsNonLegacyAndAssertMessages(
          `
          import classMethodDeclarationA from 'decorator';
          import decoratorParameter from 'decorator';
          export class TextareaAutosize {
          @classMethodDeclarationA((parameter) => parameter)
          @classMethodDeclarationA(decoratorParameter)
          @classMethodDeclarationA
          get bar() { }
          @classMethodDeclarationA((parameter) => parameter)
          @classMethodDeclarationA(decoratorParameter)
          @classMethodDeclarationA
          set bar(val) { val; }
          }
        `,
          { "no-unused-vars": 1 },
        );
      });
    });
  }

  it("detects minimal no-unused-vars case #120", () => {
    verifyAndAssertMessages("var unused;", { "no-unused-vars": 1 }, [
      "1:5 'unused' is defined but never used. no-unused-vars",
    ]);
  });

  // This two tests are disabled, as the feature to visit properties when
  // there is a spread/rest operator has been removed as it caused problems
  // with other rules #249
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip("visits excluded properties left of spread #95", () => {
    verifyAndAssertMessages(
      "var originalObject = {}; var {field1, field2, ...clone} = originalObject;",
      { "no-unused-vars": 1 },
    );
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip("visits excluded properties left of spread #210", () => {
    verifyAndAssertMessages(
      "const props = { yo: 'yo' }; const { ...otherProps } = props;",
      { "no-unused-vars": 1 },
    );
  });

  it("does not mark spread variables false-positive", () => {
    verifyAndAssertMessages(
      "var originalObject = {}; var {field1, field2, ...clone} = originalObject;",
      { "no-undef": 1, "no-redeclare": 1 },
    );
  });

  it("does not mark spread variables false-positive", () => {
    verifyAndAssertMessages(
      "const props = { yo: 'yo' }; const { ...otherProps } = props;",
      { "no-undef": 1, "no-redeclare": 1 },
    );
  });

  it("does not mark spread variables as use-before-define #249", () => {
    verifyAndAssertMessages(
      "var originalObject = {}; var {field1, field2, ...clone} = originalObject;",
      { "no-use-before-define": 1 },
    );
  });

  it("detects no-unused-vars with object destructuring #142", () => {
    verifyAndAssertMessages(
      "const {Bacona} = require('baconjs')",
      { "no-undef": 1, "no-unused-vars": 1 },
      ["1:8 'Bacona' is assigned a value but never used. no-unused-vars"],
    );
  });

  it("don't warn no-unused-vars with spread #142", () => {
    verifyAndAssertMessages(
      `
        export default function test(data) {
        return {
        foo: 'bar',
        ...data
        };
        }
      `,
      { "no-undef": 1, "no-unused-vars": 1 },
    );
  });

  it("excludes comment tokens #153", () => {
    verifyAndAssertMessages(
      `
        var a = [
        1,
        2, // a trailing comment makes this line fail comma-dangle (always-multiline)
        ];
      `,
      { "comma-dangle": [2, "always-multiline"] },
    );

    verifyAndAssertMessages(
      `
        switch (a) {
        // A comment here makes the above line fail brace-style
        case 1:
        console.log(a);
        }
      `,
      { "brace-style": 2 },
    );
  });

  it("ternary and parens #149", () => {
    verifyAndAssertMessages("true ? (true) : false;", { "space-infix-ops": 1 });
  });

  it("line comment space-in-parens #124", () => {
    verifyAndAssertMessages(
      `
        React.createClass({
        render() {
        // return (
        //   <div />
        // ); // <-- this is the line that is reported
        }
        });
      `,
      { "space-in-parens": 1 },
    );
  });

  it("block comment space-in-parens #124", () => {
    verifyAndAssertMessages(
      `
        React.createClass({
        render() {
        /*
        return (
          <div />
        ); // <-- this is the line that is reported
        */
        }
        });
      `,
      { "space-in-parens": 1 },
    );
  });

  it("no no-undef error with rest #11", () => {
    verifyAndAssertMessages("const [a, ...rest] = ['1', '2', '3']; a; rest;", {
      "no-undef": 1,
      "no-unused-vars": 1,
    });
  });

  it("async function with space-before-function-paren #168", () => {
    verifyAndAssertMessages("it('handles updates', async function() {});", {
      "space-before-function-paren": [1, "never"],
    });
  });

  it("default param flow type no-unused-vars #184", () => {
    verifyAndAssertMessages(
      `
        type ResolveOptionType = {
        depth?: number,
        identifier?: string
        };

        export default function resolve(
        options: ResolveOptionType = {}
        ): Object {
        options;
        }
      `,
      { "no-unused-vars": 1, "no-undef": 1 },
    );
  });

  it("no-use-before-define #192", () => {
    verifyAndAssertMessages(
      `
        console.log(x);
        var x = 1;
      `,
      { "no-use-before-define": 1 },
      ["1:13 'x' was used before it was defined. no-use-before-define"],
    );
  });

  it("jsx and stringliteral #216", () => {
    verifyAndAssertMessages("<div className=''></div>");
  });

  it("getter/setter #218", () => {
    verifyAndAssertMessages(
      `
        class Person {
            set a (v) { }
        }
      `,
      {
        "space-before-function-paren": 1,
        "keyword-spacing": [1, { before: true }],
        indent: 1,
      },
    );
  });

  it("getter/setter #220", () => {
    verifyAndAssertMessages(
      `
        var B = {
        get x () {
        return this.ecks;
        },
        set x (ecks) {
        this.ecks = ecks;
        }
        };
      `,
      { "no-dupe-keys": 1 },
    );
  });

  it("fixes issues with flow types and ObjectPattern", () => {
    verifyAndAssertMessages(
      `
        import type Foo from 'bar';
        export default class Foobar {
          foo({ bar }: Foo) { bar; }
          bar({ foo }: Foo) { foo; }
        }
      `,
      { "no-unused-vars": 1, "no-shadow": 1 },
    );
  });

  it("correctly detects redeclares if in script mode #217", () => {
    verifyAndAssertMessages(
      `
        var a = 321;
        var a = 123;
      `,
      { "no-redeclare": 1 },
      ["2:5 'a' is already defined. no-redeclare"],
      "script",
    );
  });

  it("correctly detects redeclares if in module mode #217", () => {
    verifyAndAssertMessages(
      `
        var a = 321;
        var a = 123;
      `,
      { "no-redeclare": 1 },
      ["2:5 'a' is already defined. no-redeclare"],
      "module",
    );
  });

  it("no-implicit-globals in script: globalReturn is false", () => {
    verifyAndAssertMessages(
      "var leakedGlobal = 1;",
      { "no-implicit-globals": 1 },
      [
        "1:5 Unexpected 'var' declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable. no-implicit-globals",
      ],
      "script",
      {
        env: {},
        parserOptions: {
          ecmaVersion: 6,
          sourceType: "script",
          ecmaFeatures: { globalReturn: false },
        },
      },
    );
  });

  it("no-implicit-globals in script: globalReturn is true", () => {
    verifyAndAssertMessages(
      "var leakedGlobal = 1;",
      { "no-implicit-globals": 1 },
      [],
      "script",
      {
        env: {},
        parserOptions: {
          ecmaVersion: 6,
          sourceType: "script",
          ecmaFeatures: { globalReturn: true },
        },
      },
    );
  });

  it("no-implicit-globals in module", () => {
    verifyAndAssertMessages(
      "var leakedGlobal = 1;",
      { "no-implicit-globals": 1 },
      [],
      "module",
      {
        env: {},
        parserOptions: { ecmaVersion: 6, sourceType: "module" },
      },
    );
  });

  it("no-implicit-globals in default", () => {
    verifyAndAssertMessages(
      "var leakedGlobal = 1;",
      { "no-implicit-globals": 1 },
      [],
      undefined,
      {
        env: {},
        parserOptions: { ecmaVersion: 6 },
      },
    );
  });

  it("allowImportExportEverywhere option (#327)", () => {
    verifyAndAssertMessages(
      `
        if (true) { import Foo from 'foo'; }
        function foo() { import Bar from 'bar'; }
        switch (a) { case 1: import FooBar from 'foobar'; }
      `,
      {},
      [],
      "module",
      {
        env: {},
        parserOptions: {
          ecmaVersion: 6,
          sourceType: "module",
          allowImportExportEverywhere: true,
        },
      },
    );
  });

  it("with does not crash parsing in script mode (strict off) #171", () => {
    verifyAndAssertMessages("with (arguments) { length; }", {}, [], "script");
  });

  it("with does crash parsing in module mode (strict on) #171", () => {
    verifyAndAssertMessages("with (arguments) { length; }", {}, [
      /'with' in strict mode/,
    ]);
  });

  it("new.target is not reported as undef #235", () => {
    verifyAndAssertMessages("function foo () { return new.target }", {
      "no-undef": 1,
    });
  });

  it("decorator does not create TypeError #229", () => {
    verifyAndAssertMessages(
      `
        class A {
          @test
          f() {}
        }
      `,
      { "no-undef": 1 },
      ["2:4 'test' is not defined. no-undef"],
    );
  });

  it("Flow definition does not trigger warnings #223", () => {
    verifyAndAssertMessages(
      `
        import { Map as $Map } from 'immutable';
        function myFunction($state: $Map, { a, b, c } : { a: ?Object, b: ?Object, c: $Map }) {}
      `,
      { "no-dupe-args": 1, "no-redeclare": 1, "no-shadow": 1 },
    );
  });

  it("newline-before-return with comments #289", () => {
    verifyAndAssertMessages(
      `
        function a() {
        if (b) {
        /* eslint-disable no-console */
        console.log('test');
        /* eslint-enable no-console */
        }

        return hasGlobal;
        }
      `,
      { "newline-before-return": 1 },
    );
  });

  it("spaced-comment with shebang #163", () => {
    verifyAndAssertMessages(
      `
        #!/usr/bin/env babel-node
        import {spawn} from 'foobar';
      `,
      { "spaced-comment": 1 },
    );
  });

  describe("Class Property Declarations", () => {
    it("no-redeclare false positive 1", () => {
      verifyAndAssertMessages(
        `
          class Group {
            static propTypes = {};
          }
          class TypicalForm {
            static propTypes = {};
          }
        `,
        { "no-redeclare": 1 },
      );
    });

    it("no-redeclare false positive 2", () => {
      verifyAndAssertMessages(
        `
          function validate() {}
          class MyComponent {
            static validate = validate;
          }
        `,
        { "no-redeclare": 1 },
      );
    });

    it("check references", () => {
      verifyAndAssertMessages(
        `
          var a;
          class A {
            prop1;
            prop2 = a;
            prop3 = b;
          }
          new A
        `,
        { "no-undef": 1, "no-unused-vars": 1, "no-redeclare": 1 },
        ["5:11 'b' is not defined. no-undef"],
      );
    });
  });

  it("dynamic import support", () => {
    verifyAndAssertMessages("import('test-module').then(() => {})");
  });

  it("regex with es6 unicodeCodePointEscapes", () => {
    verifyAndAssertMessages(
      "string.replace(/[\u{0000A0}-\u{10FFFF}<>&]/gmiu, (char) => `&#x${char.codePointAt(0).toString(16)};`);",
    );
  });

  describe("class field declarations", () => {
    describe("field declarations", () => {
      it("should not be undefined", () => {
        verifyAndAssertMessages(
          `
              class C {
                d = 1;
              }
          `,
          { "no-undef": 1 },
        );
      });

      it("should not be unused", () => {
        verifyAndAssertMessages(
          `
              export class C {
                d = 1;
              }
          `,
          { "no-unused-vars": 1 },
        );
      });
    });

    describe("private field declarations", () => {
      it("should not be undefined", () => {
        verifyAndAssertMessages(
          `
              class C {
                #d = 1;
              }
          `,
          { "no-undef": 1 },
        );
      });

      it("should not be unused", () => {
        verifyAndAssertMessages(
          `
              export class C {
                #d = 1;
              }
          `,
          { "no-unused-vars": 1 },
        );
      });

      it("type annotations should work", () => {
        verifyAndAssertMessages(
          `class C {
            #p: Array<number>
          }`,
          { "no-undef": 1 },
        );
      });
    });

    describe("private methods", () => {
      it("should not be undefined", () => {
        verifyAndAssertMessages(
          `
              class C {
                #d() {};
              }
          `,
          { "no-undef": 1 },
        );
      });

      it("should not be unused", () => {
        verifyAndAssertMessages(
          `
              export class C {
                #d() {};
              }
          `,
          { "no-unused-vars": 1 },
        );
      });

      it("should visit params", () => {
        verifyAndAssertMessages(
          `export class C {
              constructor() { this.#d(); }
              #d(unused) {};
            }
          `,
          { "no-unused-vars": 1 },
          ["3:6 'unused' is defined but never used. no-unused-vars"],
        );
      });

      it("should visit body", () => {
        verifyAndAssertMessages(
          `export class C {
              constructor() { this.#d(); }
              #d() { var unused; };
            }
          `,
          { "no-unused-vars": 1 },
          ["3:14 'unused' is defined but never used. no-unused-vars"],
        );
      });

      it("should work with no-unreachable", () => {
        verifyAndAssertMessages(
          `class C {
  #a() {
    return;
  }
  #b() {} // no-unreachable should not bail here
}`,
          { "no-unreachable": 1 },
        );
      });

      it("should work with func-names", () => {
        verifyAndAssertMessages(
          `
              export class C {
                #d() {};
              }
          `,
          { "func-names": 1 },
        );
      });

      it("should work with space-before-function-paren", () => {
        verifyAndAssertMessages(
          `
              export class C {
                #d() {};
              }
          `,
          { "space-before-function-paren": 1 },
          [
            "2:5 Missing space before function parentheses. space-before-function-paren",
          ],
        );
      });
    });
  });

  describe("optional chaining operator", () => {
    it("should not be undefined #595", () => {
      verifyAndAssertMessages(
        `
            const foo = {};
            foo?.bar;
        `,
        { "no-undef": 1 },
      );
    });
  });

  it("flow types on class method should be visited correctly", () => {
    verifyAndAssertMessages(
      `
        import type NodeType from 'foo';
        class NodeUtils {
          finishNodeAt<T : NodeType>(node: T): T { return node; }
        }

        new NodeUtils();
      `,
      { "no-unused-vars": 1 },
    );
  });

  it("works with dynamicImport", () => {
    verifyAndAssertMessages(
      `
        import('a');
      `,
    );
  });

  it("works with numericSeparator", () => {
    verifyAndAssertMessages(
      `
        1_000
      `,
    );
  });

  it("works with optionalChaining", () => {
    verifyAndAssertMessages(
      `
        a?.b
      `,
    );
  });

  it("works with import.meta", () => {
    verifyAndAssertMessages(
      `
        import.meta
      `,
    );
  });

  it("works with classPrivateProperties", () => {
    verifyAndAssertMessages(
      `
        class A { #a = 1; }
      `,
    );
  });

  it("works with classPrivateMethods", () => {
    verifyAndAssertMessages(
      `
        class A { #a(b, c) {} }
      `,
    );
  });

  it("works with arrow function classPrivateProperties", () => {
    verifyAndAssertMessages(
      `
        class A { #a = (a, b) => {}; }
      `,
    );
  });

  it("works with optionalCatchBinding", () => {
    verifyAndAssertMessages(
      `
        try {} catch {}
        try {} catch {} finally {}
      `,
    );
  });

  it("exportDefaultFrom", () => {
    verifyAndAssertMessages(
      `
        export v from "mod"
      `,
    );
  });

  it("exportNamespaceFrom", () => {
    verifyAndAssertMessages(
      `
        export * as ns from "mod"
      `,
    );
  });

  it("ignore eval in scope analysis", () => {
    verifyAndAssertMessages(
      `
        const a = 1;
        console.log(a);
        eval('');
      `,
      { "no-unused-vars": 1, "no-undef": 1 },
    );
  });
});
