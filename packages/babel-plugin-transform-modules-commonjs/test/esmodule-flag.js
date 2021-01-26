const babel = require("@babel/core");
const vm = require("vm");

test("Re-export doesn't overwrite __esModule flag", function () {
  let code = 'export * from "./dep";';
  const depStub = {
    __esModule: false,
  };

  const context = {
    module: {
      exports: {},
    },
    require: function (id) {
      if (id === "./dep") return depStub;
      return require(id);
    },
  };
  context.exports = context.module.exports;

  code = babel.transformSync(code, {
    cwd: __dirname,
    plugins: [[require("../"), { loose: true }]],
    ast: false,
  }).code;

  vm.runInNewContext(code, context);

  // exports.__esModule shouldn't be overwritten.
  expect(context.exports.__esModule).toBe(true);
});
