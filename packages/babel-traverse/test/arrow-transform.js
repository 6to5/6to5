import { NodePath } from "../lib";
import assert from "assert";
import { parse } from "babylon";
import generate from "babel-generator";
import * as t from "babel-types";

function assertConversion(
  input,
  output,
  { methodName = "method", extend = false, arrowOpts } = {},
) {
  const inputAst = wrapMethod(input, methodName, extend);
  const outputAst = wrapMethod(output, methodName, extend);

  const rootPath = NodePath.get({
    hub: {
      file: {
        addHelper(helperName) {
          return t.memberExpression(
            t.identifier("babelHelpers"),
            t.identifier(helperName),
          );
        },
      },
    },
    parentPath: null,
    parent: inputAst,
    container: inputAst,
    key: "program",
  }).setContext();

  rootPath.traverse({
    ClassMethod(path) {
      path.get("body.body.0.expression").arrowFunctionToExpression(arrowOpts);
    },
  });

  assert.equal(generate(inputAst).code, generate(outputAst).code);
}

function wrapMethod(body, methodName, extend) {
  return parse(
    `
    class Example ${extend ? "extends class {}" : ""} {
      ${methodName}() {${body} }
    }
  `,
    { plugins: ["jsx"] },
  );
}

describe("arrow function conversion", () => {
  it("should convert super calls in constructors", () => {
    assertConversion(
      `
      () => {
        super(345);
      };
      super();
      () => super();
    `,
      `
      var _supercall = (..._args) => super(..._args);

      (function () {
        _supercall(345);
      });
      _supercall();
      () => _supercall();
    `,
      { methodName: "constructor" },
    );
  });

  it("should convert super calls and this references in constructors", () => {
    assertConversion(
      `
      () => {
        super(345);
        this;
      };
      super();
      this;
      () => super();
      () => this;
    `,
      `
      var _supercall = (..._args) => _this = super(..._args),
          _this;

      (function () {
        _supercall(345);
        _this;
      });
      _supercall();
      this;
      () => _supercall();
      () => this;
    `,
      { methodName: "constructor", extend: true },
    );
  });

  it("should convert this references in constructors", () => {
    assertConversion(
      `
      () => {
        this;
      };
      super();
      this;
      () => super();
      () => this;
    `,
      `
      var _this;

      (function () {
        _this;
      });
      _this = super();
      this;
      () => _this = super();
      () => this;
    `,
      { methodName: "constructor", extend: true },
    );
  });

  it("should convert this references in constructors with spec compliance", () => {
    assertConversion(
      `
      () => {
        this;
      };
      super();
      this;
      () => super();
      () => this;
    `,
      `
      var _this,
          _arrowCheckId = {};

      (function () {
        babelHelpers.newArrowCheck(this, _arrowCheckId);

        _this;
      }).bind(_arrowCheckId);
      _this = super();
      this;
      () => _this = super();
      () => this;
    `,
      {
        methodName: "constructor",
        extend: true,
        arrowOpts: { specCompliant: true },
      },
    );
  });

  it("should convert this references in constructors without extension", () => {
    assertConversion(
      `
      () => {
        this;
      };
      this;
      () => this;
    `,
      `
      var _this = this;

      (function () {
        _this;
      });
      this;
      () => this;
    `,
      { methodName: "constructor" },
    );
  });

  it("should convert this references in constructors with spec compliance without extension", () => {
    assertConversion(
      `
      () => {
        this;
      };
      this;
      () => this;
    `,
      `
      var _this = this;

      (function () {
        babelHelpers.newArrowCheck(this, _this);

        this;
      }).bind(this);
      this;
      () => this;
    `,
      { methodName: "constructor", arrowOpts: { specCompliant: true } },
    );
  });

  it("should convert this references in methods", () => {
    assertConversion(
      `
      () => {
        this;
      };
      this;
      () => this;
    `,
      `
      var _this = this;

      (function () {
        _this;
      });
      this;
      () => this;
    `,
    );
  });

  it("should convert this references in methods with spec compliance", () => {
    assertConversion(
      `
      () => {
        this;
      };
      this;
      () => this;
    `,
      `
      var _this = this;

      (function () {
        babelHelpers.newArrowCheck(this, _this);

        this;
      }).bind(this);
      this;
      () => this;
    `,
      { arrowOpts: { specCompliant: true } },
    );
  });

  it("should convert this references inside JSX in methods", () => {
    assertConversion(
      `
      () => {
        <this.this this="" />;
      };
      <this.this this="" />;
      () => <this.this this="" />;
    `,
      `
      var _this = this;

      (function () {
        <_this.this this="" />;
      });
      <this.this this="" />;
      () => <this.this this="" />;
    `,
    );
  });

  it("should convert arguments references", () => {
    assertConversion(
      `
      () => {
        arguments;
      };
      arguments;
      () => arguments;
    `,
      `
      var _arguments = arguments;

      (function () {
        _arguments;
      });
      arguments;
      () => arguments;
    `,
    );
  });

  it("should convert new.target references", () => {
    assertConversion(
      `
      () => {
        new.target;
      };
      new.target;
      () => new.target;
    `,
      `
      var _newtarget = new.target;

      (function () {
        _newtarget;
      });
      new.target;
      () => new.target;
    `,
    );
  });

  it("should convert super.prop references", () => {
    assertConversion(
      `
      () => {
        var tmp = super.foo;
      };
      super.foo;
      () => super.foo;
    `,
      `
      var _superprop_getFoo = () => super.foo;

      (function () {
        var tmp = _superprop_getFoo();
      });
      super.foo;
      () => super.foo;
    `,
    );
  });

  it("should convert super[prop] references", () => {
    assertConversion(
      `
      () => {
        var tmp = super[foo];
      };
      super[foo];
      () => super[foo];
    `,
      `
      var _superprop_get = _prop => super[_prop];

      (function () {
        var tmp = _superprop_get(foo);
      });
      super[foo];
      () => super[foo];
    `,
    );
  });

  it("should convert super.prop assignment", () => {
    assertConversion(
      `
      () => {
        super.foo = 4;
      };
      super.foo = 4;
      () => super.foo = 4;
    `,
      `
      var _superprop_setFoo = _value => super.foo = _value;

      (function () {
        _superprop_setFoo(4);
      });
      super.foo = 4;
      () => super.foo = 4;
    `,
    );
  });

  it("should convert super[prop] assignment", () => {
    assertConversion(
      `
      () => {
        super[foo] = 4;
      };
      super[foo] = 4;
      () => super[foo] = 4;
    `,
      `
      var _superprop_set = (_prop, _value) => super[_prop] = _value;

      (function () {
        _superprop_set(foo, 4);
      });
      super[foo] = 4;
      () => super[foo] = 4;
    `,
    );
  });

  it("should convert super.prop operator assign", () => {
    assertConversion(
      `
      () => {
        super.foo **= 4;
      };
      super.foo **= 4;
      () => super.foo **= 4;
    `,
      `
      var _superprop_setFoo = _value => super.foo = _value,
          _superprop_getFoo = () => super.foo;

      (function () {
        _superprop_setFoo(_superprop_getFoo() ** 4);
      });
      super.foo **= 4;
      () => super.foo **= 4;
    `,
    );
  });

  it("should convert super[prop] operator assign", () => {
    assertConversion(
      `
      () => {
        super[foo] **= 4;
      };
      super[foo] **= 4;
      () => super[foo] **= 4;
    `,
      `
      var _superprop_set = (_prop, _value) => super[_prop] = _value,
          _superprop_get = _prop2 => super[_prop2];

      (function () {
        var _tmp;

        _superprop_set(_tmp = foo, _superprop_get(_tmp) ** 4);
      });
      super[foo] **= 4;
      () => super[foo] **= 4;
    `,
    );
  });

  it("should convert super.prop prefix update", () => {
    assertConversion(
      `
      () => {
        ++super.foo;
      };
      ++super.foo;
      () => ++super.foo;
    `,
      `
      var _superprop_getFoo = () => super.foo,
          _superprop_setFoo = _value => super.foo = _value;

      (function () {
        var _tmp;

        _tmp = _superprop_getFoo(), _superprop_setFoo(_tmp + 1);
      });
      ++super.foo;
      () => ++super.foo;
    `,
    );
  });

  it("should convert super[prop] prefix update", () => {
    assertConversion(
      `
      () => {
        ++super[foo];
      };
      ++super[foo];
      () => ++super[foo];
    `,
      `
      var _superprop_get = _prop2 => super[_prop2],
          _superprop_set = (_prop3, _value) => super[_prop3] = _value;

      (function () {
        var _tmp, _prop;

        _tmp = _superprop_get(_prop = foo), _superprop_set(_prop, _tmp + 1);
      });
      ++super[foo];
      () => ++super[foo];
    `,
    );
  });

  it("should convert super.prop suffix update", () => {
    assertConversion(
      `
      () => {
        super.foo++;
      };
      super.foo++;
      () => super.foo++;
    `,
      `
      var _superprop_getFoo = () => super.foo,
          _superprop_setFoo = _value => super.foo = _value;

      (function () {
        var _tmp;

        _tmp = _superprop_getFoo(), _superprop_setFoo(_tmp + 1), _tmp;
      });
      super.foo++;
      () => super.foo++;
    `,
    );
  });

  it("should convert super[prop] suffix update", () => {
    assertConversion(
      `
      () => {
        super[foo]++;
      };
      super[foo]++;
      () => super[foo]++;
    `,
      `
      var _superprop_get = _prop2 => super[_prop2],
          _superprop_set = (_prop3, _value) => super[_prop3] = _value;

      (function () {
        var _tmp, _prop;

        _tmp = _superprop_get(_prop = foo), _superprop_set(_prop, _tmp + 1), _tmp;
      });
      super[foo]++;
      () => super[foo]++;
    `,
    );
  });

  it("should convert super.prop() calls", () => {
    assertConversion(
      `
      () => {
        super.foo();
      };
      super.foo();
      () => super.foo();
    `,
      `
      var _superprop_callFoo = (..._args) => super.foo(..._args);

      (function () {
        _superprop_callFoo();
      });
      super.foo();
      () => super.foo();
    `,
    );
  });

  it("should convert super[prop]() calls", () => {
    assertConversion(
      `
      () => {
        super[foo]();
      };
      super[foo]();
      () => super[foo]();
    `,
      `
      var _superprop_call = (_prop, ..._args) => super[_prop](..._args);

      (function () {
        _superprop_call(foo);
      });
      super[foo]();
      () => super[foo]();
    `,
    );
  });
});
