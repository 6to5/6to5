const assert = require("assert");
const babel = require("babel-core");
const vm = require("vm");

test("Re-export doesn't overwrite __esModule flag", function() {
  let code = 'export * from "./dep";';
  const depStub = {
    __esModule: false,
  };

  const context = {
    module: {
      exports: {},
    },
    require: function(id) {
      if (id === "./dep") return depStub;
      return require(id);
    },
  };
  context.exports = context.module.exports;

  code = babel.transform(code, {
    plugins: [[require("../"), { loose: true }]],
    ast: false,
  }).code;

  vm.runInNewContext(code, context);

  // exports.__esModule shouldn't be overwritten.
  assert.equal(
    context.exports.__esModule,
    true,
    "Expected exports.__esModule === true",
  );
});
