import {
  loadOptions as loadOptionsOrig,
  loadOptionsAsync as loadOptionsAsyncOrig,
} from "../lib";
import path from "path";
import { fileURLToPath } from "url";

const cwd = path.dirname(fileURLToPath(import.meta.url));

function loadOptions(opts) {
  return loadOptionsOrig({ cwd, ...opts });
}
function loadOptionsAsync(opts) {
  return loadOptionsAsyncOrig({ cwd, ...opts });
}

describe("option-manager", () => {
  it("throws for babel 5 plugin", () => {
    return expect(() => {
      loadOptions({
        plugins: [({ Plugin }) => new Plugin("object-assign", {})],
      });
    }).toThrow(/Babel 5 plugin is being run with an unsupported Babel/);
  });

  describe("config plugin/preset flattening and overriding", () => {
    function makePlugin() {
      const calls = [];
      const plugin = (api, opts) => {
        calls.push(opts);
        return {};
      };
      return { plugin, calls };
    }

    it("should throw when an option is provided as a preset", () => {
      expect(() => {
        loadOptions({
          presets: [
            "./fixtures/option-manager/babel-preset-bar",
            { useBuiltIns: "entry" },
          ],
        });
      }).toThrowErrorMatchingSnapshot();
    });

    it("should throw when an option is provided as a plugin", () => {
      expect(() => {
        loadOptions({
          plugins: [
            "./fixtures/option-manager/babel-plugin-foo",
            { useSpread: true },
          ],
        });
      }).toThrowErrorMatchingSnapshot();
    });

    it("should throw when an option is following a preset", () => {
      expect(() => {
        loadOptions({
          presets: [
            "./fixtures/option-manager/babel-plugin-foo",
            "./fixtures/option-manager/babel-preset-bar",
            { useSpread: true },
          ],
        });
      }).toThrowErrorMatchingSnapshot();
    });

    it("should not throw when a preset string followed by valid preset object", async () => {
      const { plugin } = makePlugin();
      expect(
        await loadOptionsAsync({
          presets: [
            "@babel/env",
            { plugins: [[plugin, undefined, "my-plugin"]] },
          ],
        }),
      ).toBeTruthy();
    });

    it("should throw if a plugin name is repeated, with information about the repeated plugin", () => {
      const { calls, plugin } = makePlugin();

      expect(() => {
        loadOptions({
          plugins: [
            [plugin, undefined, "my-plugin"],
            [plugin, undefined, "my-plugin"],
          ],
        });
      }).toThrow(
        /Duplicate plugin\/preset detected.*Duplicates detected are.*my-plugin.*my-plugin/ms,
      );
      expect(calls).toEqual([]);
    });

    it("throws for null options", () => {
      const { calls, plugin } = makePlugin();
      expect(() => {
        loadOptions({
          plugins: [[plugin, null]],
        });
      }).toThrow(".plugins[0][1] must be an object, false, or undefined");

      expect(calls).toEqual([]);
    });

    it("should not throw if a repeated plugin has a different name", () => {
      const { calls, plugin } = makePlugin();

      loadOptions({
        plugins: [
          [plugin, { arg: 1 }],
          [plugin, { arg: 2 }, "some-name"],
        ],
      });
      expect(calls).toEqual([{ arg: 1 }, { arg: 2 }]);
    });

    it("should merge .env[] plugins with parent presets", () => {
      const { calls: calls1, plugin: plugin1 } = makePlugin();
      const { calls: calls2, plugin: plugin2 } = makePlugin();

      loadOptions({
        envName: "test",
        plugins: [[plugin1, { arg: 1 }]],
        env: {
          test: {
            plugins: [
              [plugin1, { arg: 3 }],
              [plugin2, { arg: 2 }],
            ],
          },
        },
      });
      expect(calls1).toEqual([{ arg: 3 }]);
      expect(calls2).toEqual([{ arg: 2 }]);
    });

    it("should throw if a preset is repeated", () => {
      const { calls, plugin: preset } = makePlugin();

      expect(() => {
        loadOptions({
          presets: [preset, preset],
        });
      }).toThrow(/Duplicate plugin\/preset detected/);
      expect(calls).toEqual([]);
    });

    it("should not throw if a repeated preset has a different name", () => {
      const { calls, plugin: preset } = makePlugin();

      loadOptions({
        presets: [
          [preset, { arg: 1 }],
          [preset, { arg: 2 }, "some-name"],
        ],
      });
      expect(calls).toEqual([{ arg: 1 }, { arg: 2 }]);
    });
    it("should merge .env[] presets with parent presets", () => {
      const { calls: calls1, plugin: preset1 } = makePlugin();
      const { calls: calls2, plugin: preset2 } = makePlugin();

      loadOptions({
        envName: "test",
        presets: [[preset1, { arg: 1 }]],
        env: {
          test: {
            presets: [
              [preset1, { arg: 3 }],
              [preset2, { arg: 2 }],
            ],
          },
        },
      });
      expect(calls1).toEqual([{ arg: 3 }]);
      expect(calls2).toEqual([{ arg: 2 }]);
    });

    it("should not merge .env[] presets with parent presets when passPerPreset", () => {
      const { calls: calls1, plugin: preset1 } = makePlugin();
      const { calls: calls2, plugin: preset2 } = makePlugin();

      loadOptions({
        envName: "test",
        passPerPreset: true,
        presets: [[preset1, { arg: 1 }]],
        env: {
          test: {
            presets: [
              [preset1, { arg: 3 }],
              [preset2, { arg: 2 }],
            ],
          },
        },
      });
      expect(calls1).toEqual([{ arg: 1 }, { arg: 3 }]);
      expect(calls2).toEqual([{ arg: 2 }]);
    });
  });

  describe("mergeOptions", () => {
    it("throws for removed babel 5 options", () => {
      return expect(() => {
        loadOptions({
          randomOption: true,
        });
      }).toThrow(/Unknown option: .randomOption/);
    });

    it("throws for removed babel 5 options", () => {
      return expect(() => {
        loadOptions({
          auxiliaryComment: true,
          blacklist: true,
        });
      }).toThrow(
        // eslint-disable-next-line max-len
        /Using removed Babel 5 option: .auxiliaryComment - Use `auxiliaryCommentBefore` or `auxiliaryCommentAfter`/,
      );
    });

    it("throws for resolved but erroring preset", () => {
      return expect(() => {
        loadOptions({
          presets: [path.join(cwd, "fixtures/option-manager/not-a-preset")],
        });
      }).toThrow(
        /While processing: .*option-manager(?:\/|\\\\)not-a-preset\.js/,
      );
    });
  });

  describe("presets", function () {
    function presetTest(name) {
      it(name, function () {
        const options = loadOptions({
          presets: [path.join(cwd, "fixtures/option-manager/presets", name)],
        });

        expect(Array.isArray(options.plugins)).toBe(true);
        expect(options.plugins).toHaveLength(1);
        expect(options.presets).toHaveLength(0);
      });
    }

    function presetThrowsTest(name, msg) {
      it(name, function () {
        expect(() =>
          loadOptions({
            presets: [path.join(cwd, "fixtures/option-manager/presets", name)],
          }),
        ).toThrow(msg);
      });
    }

    presetTest("es5_function");
    presetTest("es5_object");
    presetTest("es2015_default_function");
    presetTest("es2015_default_object");

    presetThrowsTest(
      "es2015_named",
      /Must export a default export when using ES6 modules/,
    );
    presetThrowsTest("es2015_invalid", /Unsupported format: string/);
    presetThrowsTest("es5_invalid", /Unsupported format: string/);
  });
});
