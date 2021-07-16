import eslint from "eslint";
import path from "path";
import { fileURLToPath } from "url";

describe("Babel config files", () => {
  const babel8 = process.env.BABEL_8_BREAKING ? it : it.skip;

  babel8("works with babel.config.mjs", () => {
    const engine = new eslint.CLIEngine({ ignore: false });
    expect(
      engine.executeOnFiles([
        path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          `../fixtures/mjs-config-file/a.js`,
        ),
      ]),
    ).toMatchObject({ errorCount: 0 });
  });

  const babel7node12 =
    process.env.BABEL_8_BREAKING || parseInt(process.versions.node) < 12
      ? it.skip
      : it;

  babel7node12("experimental worker works with babel.config.mjs", () => {
    const engine = new eslint.CLIEngine({ ignore: false });
    expect(
      engine.executeOnFiles([
        path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          `../fixtures/mjs-config-file-babel-7/a.js`,
        ),
      ]),
    ).toMatchObject({ errorCount: 0 });
  });
});
