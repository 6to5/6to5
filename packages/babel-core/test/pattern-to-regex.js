import path from "path";
import patternToRegex from "../lib/config/pattern-to-regex";

describe("patternToRegex", function () {
  const dirname = process.cwd();

  it.each([
    [dirname, ".", true],
    [dirname + path.sep, ".", true],
    [path.resolve(dirname, "node_modules", "my-package"), ".", true],
    [dirname, ".", false],
    [dirname + path.sep, ".", false],
  ])(`%s matches pattern %s when matchPrefix is %s`, function (
    test,
    pattern,
    matchPrefix,
  ) {
    const regex = patternToRegex(pattern, dirname, matchPrefix);

    expect(test).toMatch(regex);
  });

  it.each([[path.join(dirname, "node_modules", "my-package"), ".", false]])(
    `%s does not match pattern %s when matchPrefix is %s`,
    function (test, pattern, matchPrefix) {
      const regex = patternToRegex(pattern, dirname, matchPrefix);

      expect(test).not.toMatch(regex);
    },
  );
});
