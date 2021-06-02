import compatData from "@babel/compat-data/plugins";

import * as babelPresetEnv from "../lib/index";
import removeRegeneratorEntryPlugin from "../lib/polyfills/regenerator";
import pluginLegacyBabelPolyfill from "../lib/polyfills/babel-polyfill";
import transformations from "../lib/module-transformations";
import availablePlugins from "../lib/available-plugins";

import pluginCoreJS2 from "babel-plugin-polyfill-corejs2";
import pluginCoreJS3 from "babel-plugin-polyfill-corejs3";
import pluginRegenerator from "babel-plugin-polyfill-regenerator";

describe("babel-preset-env", () => {
  describe("transformIncludesAndExcludes", () => {
    it("should return in transforms array", () => {
      expect(
        babelPresetEnv.transformIncludesAndExcludes([
          "transform-arrow-functions",
        ]),
      ).toEqual({
        all: ["transform-arrow-functions"],
        plugins: new Set(["transform-arrow-functions"]),
        builtIns: new Set(),
      });
    });

    it("should return in built-ins array", () => {
      expect(babelPresetEnv.transformIncludesAndExcludes(["es.map"])).toEqual({
        all: ["es.map"],
        plugins: new Set(),
        builtIns: new Set(["es.map"]),
      });
    });
  });
  describe("getModulesPluginNames", () => {
    describe("modules is set to false", () => {
      it("returns only syntax plugins", () => {
        expect(
          babelPresetEnv.getModulesPluginNames({
            modules: false,
            transformations,
            shouldTransformESM: false,
            shouldTransformDynamicImport: false,
            shouldTransformExportNamespaceFrom: false,
          }),
        ).toEqual(["syntax-dynamic-import", "syntax-export-namespace-from"]);
      });
    });
    describe("modules is not set to false", () => {
      describe("ESMs should not be transformed", () => {
        it("returns syntax plugins", () => {
          expect(
            babelPresetEnv.getModulesPluginNames({
              modules: "commonjs",
              transformations,
              shouldTransformESM: false,
              shouldTransformDynamicImport: false,
              shouldTransformExportNamespaceFrom: false,
            }),
          ).toEqual(["syntax-dynamic-import", "syntax-export-namespace-from"]);
        });
      });
      describe("ESMs should be transformed", () => {
        describe("dynamic imports should not be transformed", () => {
          it("returns specified modules transform and syntax-dynamic-import", () => {
            expect(
              babelPresetEnv.getModulesPluginNames({
                modules: "commonjs",
                transformations,
                shouldTransformESM: true,
                shouldTransformDynamicImport: false,
                shouldTransformExportNamespaceFrom: false,
              }),
            ).toEqual([
              "transform-modules-commonjs",
              "syntax-dynamic-import",
              "syntax-export-namespace-from",
            ]);
          });
        });
        describe("dynamic imports should be transformed", () => {
          it("returns specified modules transform and proposal-dynamic-import", () => {
            expect(
              babelPresetEnv.getModulesPluginNames({
                modules: "systemjs",
                transformations,
                shouldTransformESM: true,
                shouldTransformDynamicImport: true,
                shouldTransformExportNamespaceFrom: false,
              }),
            ).toEqual([
              "transform-modules-systemjs",
              "proposal-dynamic-import",
              "syntax-export-namespace-from",
            ]);
          });
          describe("export namespace from should be transformed", () => {
            it("works", () => {
              expect(
                babelPresetEnv.getModulesPluginNames({
                  modules: "systemjs",
                  transformations,
                  shouldTransformESM: true,
                  shouldTransformDynamicImport: true,
                  shouldTransformExportNamespaceFrom: true,
                }),
              ).toEqual([
                "transform-modules-systemjs",
                "proposal-dynamic-import",
                "proposal-export-namespace-from",
              ]);
            });
          });
        });
      });
    });
  });
  describe("getPolyfillPlugins", () => {
    const staticProps = {
      polyfillTargets: [],
      include: new Set(),
      exclude: new Set(),
      proposals: false,
      shippedProposals: false,
      debug: false,
    };
    describe("useBuiltIns is false", () => {
      it("returns no polyfill plugins", () => {
        expect(
          babelPresetEnv.getPolyfillPlugins(
            Object.assign(
              {
                useBuiltIns: false,
                corejs: false,
                regenerator: false,
              },
              staticProps,
            ),
          ),
        ).toEqual([]);
      });
    });
    describe("useBuiltIns is not false", () => {
      describe("corejs is not given", () => {
        it("returns no polyfill plugins", () => {
          expect(
            babelPresetEnv.getPolyfillPlugins(
              Object.assign(
                {
                  useBuiltIns: "usage",
                  corejs: false,
                  regenerator: false,
                },
                staticProps,
              ),
            ),
          ).toEqual([]);
        });
      });
      describe("useBuiltIns is set to usage", () => {
        describe("using corejs 2", () => {
          it("returns an array with core js 2 usage plugin", () => {
            const polyfillPlugins = babelPresetEnv.getPolyfillPlugins(
              Object.assign(
                {
                  useBuiltIns: "usage",
                  corejs: { major: 2 },
                  regenerator: false,
                },
                staticProps,
              ),
            );
            expect(polyfillPlugins.length).toBe(2);
            expect(polyfillPlugins[0][0]).toEqual(pluginCoreJS2);
            expect(polyfillPlugins[1][0]).toEqual(pluginLegacyBabelPolyfill);
          });
        });
        describe("using corejs 3", () => {
          describe("regenerator is set to false", () => {
            it("returns an array with core js 3 usage plugin", () => {
              const polyfillPlugins = babelPresetEnv.getPolyfillPlugins(
                Object.assign(
                  {
                    useBuiltIns: "usage",
                    corejs: { major: 3 },
                    regenerator: false,
                  },
                  staticProps,
                ),
              );
              expect(polyfillPlugins.length).toBe(2);
              expect(polyfillPlugins[0][0]).toEqual(pluginCoreJS3);
              expect(polyfillPlugins[1][0]).toEqual(pluginLegacyBabelPolyfill);
            });
          });

          describe("regenerator is set to true", () => {
            it("returns an array with core js 3 usage plugin and add regenerator usage plugin", () => {
              const polyfillPlugins = babelPresetEnv.getPolyfillPlugins(
                Object.assign(
                  {
                    useBuiltIns: "usage",
                    corejs: { major: 3 },
                    regenerator: true,
                  },
                  staticProps,
                ),
              );
              expect(polyfillPlugins.length).toBe(3);
              expect(polyfillPlugins[0][0]).toEqual(pluginCoreJS3);
              expect(polyfillPlugins[1][0]).toEqual(pluginLegacyBabelPolyfill);
              expect(polyfillPlugins[2][0]).toEqual(pluginRegenerator);
            });
          });
        });
      });
      describe("useBuiltIns is set to entry", () => {
        describe("using corejs 2", () => {
          it("returns an array with core js 2 entry plugin", () => {
            const polyfillPlugins = babelPresetEnv.getPolyfillPlugins(
              Object.assign(
                {
                  useBuiltIns: "entry",
                  corejs: { major: 2 },
                  regenerator: true,
                },
                staticProps,
              ),
            );
            expect(polyfillPlugins.length).toBe(2);
            expect(polyfillPlugins[0][0]).toEqual(pluginLegacyBabelPolyfill);
            expect(polyfillPlugins[1][0]).toEqual(pluginCoreJS2);
          });
        });
        describe("using corejs 3", () => {
          describe("regenerator is set to true", () => {
            it("returns an array with core js 3 entry plugin", () => {
              const polyfillPlugins = babelPresetEnv.getPolyfillPlugins(
                Object.assign(
                  {
                    useBuiltIns: "entry",
                    corejs: { major: 3 },
                    regenerator: true,
                  },
                  staticProps,
                ),
              );
              expect(polyfillPlugins.length).toBe(2);
              expect(polyfillPlugins[0][0]).toEqual(pluginCoreJS3);
              expect(polyfillPlugins[1][0]).toEqual(pluginLegacyBabelPolyfill);
            });
          });

          describe("regenerator is set to false", () => {
            it("returns an array with core js 3 entry plugin and remove regenerator entry plugin", () => {
              const polyfillPlugins = babelPresetEnv.getPolyfillPlugins(
                Object.assign(
                  {
                    useBuiltIns: "entry",
                    corejs: { major: 3 },
                    regenerator: false,
                  },
                  staticProps,
                ),
              );
              expect(polyfillPlugins.length).toBe(3);
              expect(polyfillPlugins[0][0]).toEqual(pluginCoreJS3);
              expect(polyfillPlugins[1][0]).toEqual(pluginLegacyBabelPolyfill);
              expect(polyfillPlugins[2][0]).toEqual(
                removeRegeneratorEntryPlugin,
              );
            });
          });
        });
      });
    });
  });

  it("available-plugins is in sync with @babel/compat-data", () => {
    const arrAvailablePlugins = Object.keys(availablePlugins).sort();
    const arrCompatData = Object.keys(compatData).sort();

    expect(arrAvailablePlugins).toEqual(expect.arrayContaining(arrCompatData));
  });
});
