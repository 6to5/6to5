import { parseSync } from "@babel/core";
import syntaxDecorators from "../lib";

function makeParser(code, options) {
  return () =>
    parseSync(code, {
      babelrc: false,
      configFile: false,
      plugins: [[syntaxDecorators, options]],
    });
}

describe("'legacy' option", function () {
  test("must be boolean", function () {
    expect(makeParser("", { legacy: "legacy" })).toThrow();
  });

  test("'legacy': false", function () {
    expect(makeParser("({ @dec fn() {} })", { legacy: false })).toThrow();
  });

  test("'legacy': true", function () {
    expect(makeParser("({ @dec fn() {} })", { legacy: true })).not.toThrow();
  });

  test("defaults to 'false'", function () {
    expect(makeParser("({ @dec fn() {} })", {})).toThrow();
  });
});

describe("'decoratorsBeforeExport' option", function () {
  test("must be boolean", function () {
    expect(makeParser("", { decoratorsBeforeExport: "before" })).toThrow();
  });

  test("is required", function () {
    expect(makeParser("", { legacy: false })).toThrow(/decoratorsBeforeExport/);
  });

  test("is incompatible with legacy", function () {
    expect(
      makeParser("", { decoratorsBeforeExport: false, legacy: true }),
    ).toThrow();
  });

  const BEFORE = "@dec export class Foo {}";
  const AFTER = "export @dec class Foo {}";

  // These are skipped
  run(BEFORE, true, false);
  run(AFTER, true, true);
  run(BEFORE, false, true);
  run(AFTER, false, false);

  function run(code, before, throws) {
    const name =
      (before === undefined ? "default" : before) +
      " - decorators " +
      (code === BEFORE ? "before" : "after") +
      "export";

    test(name, function () {
      const expectTheParser = expect(
        makeParser(code, { decoratorsBeforeExport: before }),
      );
      throws ? expectTheParser.toThrow() : expectTheParser.not.toThrow();
    });
  }
});
