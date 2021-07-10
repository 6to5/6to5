import env from "..";
import * as babel from "@babel/core";

describe("supportsTopLevelAwait enables the parser plugin for old parser versions", () => {
  function extractParserOptions(api, { ref }) {
    return {
      manipulateOptions(opts, parserOpts) {
        ref.parserOpts = parserOpts;
      },
      visitor: {},
    };
  }

  it("supported", () => {
    const ref = {};
    babel.transformSync("", {
      configFile: false,
      presets: [env],
      plugins: [[extractParserOptions, { ref }]],
      caller: {
        name: "test",
        supportsTopLevelAwait: true,
      },
    });

    expect(ref.parserOpts.plugins).toContain("topLevelAwait");
  });

  it("unsupported", () => {
    const ref = {};
    babel.transformSync("", {
      configFile: false,
      presets: [env],
      plugins: [[extractParserOptions, { ref }]],
      caller: {
        name: "test",
      },
    });

    expect(ref.parserOpts.plugins).not.toContain("topLevelAwait");
  });
});
