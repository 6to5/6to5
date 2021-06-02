import { declare } from "@babel/helper-plugin-utils";
import { addDefault, isModule } from "@babel/helper-module-imports";
import { types as t } from "@babel/core";

import { hasMinVersion } from "./helpers";
import getRuntimePath from "./get-runtime-path";

import pluginCorejs2 from "babel-plugin-polyfill-corejs2";
import pluginCorejs3 from "babel-plugin-polyfill-corejs3";
import pluginRegenerator from "babel-plugin-polyfill-regenerator";

const pluginsCompat = "#__secret_key__@babel/runtime__compatibility";

function supportsStaticESM(caller) {
  return !!caller?.supportsStaticESM;
}

export default declare((api, options, dirname) => {
  api.assertVersion(7);

  const {
    corejs,
    helpers: useRuntimeHelpers = true,
    regenerator: useRuntimeRegenerator = true,
    useESModules = false,
    version: runtimeVersion = "7.0.0-beta.0",
    absoluteRuntime = false,
  } = options;

  let proposals = false;
  let rawVersion;

  if (typeof corejs === "object" && corejs !== null) {
    rawVersion = corejs.version;
    proposals = Boolean(corejs.proposals);
  } else {
    rawVersion = corejs;
  }

  const corejsVersion = rawVersion ? Number(rawVersion) : false;

  if (![false, 2, 3].includes(corejsVersion)) {
    throw new Error(
      `The \`core-js\` version must be false, 2 or 3, but got ${JSON.stringify(
        rawVersion,
      )}.`,
    );
  }

  if (proposals && (!corejsVersion || corejsVersion < 3)) {
    throw new Error(
      "The 'proposals' option is only supported when using 'corejs: 3'",
    );
  }

  if (typeof useRuntimeRegenerator !== "boolean") {
    throw new Error(
      "The 'regenerator' option must be undefined, or a boolean.",
    );
  }

  if (typeof useRuntimeHelpers !== "boolean") {
    throw new Error("The 'helpers' option must be undefined, or a boolean.");
  }

  if (typeof useESModules !== "boolean" && useESModules !== "auto") {
    throw new Error(
      "The 'useESModules' option must be undefined, or a boolean, or 'auto'.",
    );
  }

  if (
    typeof absoluteRuntime !== "boolean" &&
    typeof absoluteRuntime !== "string"
  ) {
    throw new Error(
      "The 'absoluteRuntime' option must be undefined, a boolean, or a string.",
    );
  }

  if (typeof runtimeVersion !== "string") {
    throw new Error(`The 'version' option must be a version string.`);
  }

  // In recent @babel/runtime versions, we can use require("helper").default
  // instead of require("helper") so that it has the same interface as the
  // ESM helper, and bundlers can better exchange one format for the other.
  // TODO(Babel 8): Remove this check, it's always true
  const DUAL_MODE_RUNTIME = "7.13.0";
  const supportsCJSDefault = hasMinVersion(DUAL_MODE_RUNTIME, runtimeVersion);

  function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  if (has(options, "useBuiltIns")) {
    if (options.useBuiltIns) {
      throw new Error(
        "The 'useBuiltIns' option has been removed. The @babel/runtime " +
          "module now uses builtins by default.",
      );
    } else {
      throw new Error(
        "The 'useBuiltIns' option has been removed. Use the 'corejs'" +
          "option to polyfill with `core-js` via @babel/runtime.",
      );
    }
  }

  if (has(options, "polyfill")) {
    if (options.polyfill === false) {
      throw new Error(
        "The 'polyfill' option has been removed. The @babel/runtime " +
          "module now skips polyfilling by default.",
      );
    } else {
      throw new Error(
        "The 'polyfill' option has been removed. Use the 'corejs'" +
          "option to polyfill with `core-js` via @babel/runtime.",
      );
    }
  }

  if (has(options, "moduleName")) {
    throw new Error(
      "The 'moduleName' option has been removed. @babel/transform-runtime " +
        "no longer supports arbitrary runtimes. If you were using this to " +
        "set an absolute path for Babel's standard runtimes, please use the " +
        "'absoluteRuntime' option.",
    );
  }

  const esModules =
    useESModules === "auto" ? api.caller(supportsStaticESM) : useESModules;

  const injectCoreJS2 = corejsVersion === 2;
  const injectCoreJS3 = corejsVersion === 3;

  const moduleName = injectCoreJS3
    ? "@babel/runtime-corejs3"
    : injectCoreJS2
    ? "@babel/runtime-corejs2"
    : "@babel/runtime";

  const HEADER_HELPERS = ["interopRequireWildcard", "interopRequireDefault"];

  const modulePath = getRuntimePath(moduleName, dirname, absoluteRuntime);

  function createCorejsPlgin(plugin, options, regeneratorPlugin) {
    return (api, _, filename) => {
      return {
        ...plugin(api, options, filename),
        inherits: regeneratorPlugin,
      };
    };
  }

  function createRegeneratorPlugin(options) {
    if (!useRuntimeRegenerator) return undefined;
    return (api, _, filename) => {
      return pluginRegenerator(api, options, filename);
    };
  }

  const corejsExt = absoluteRuntime ? ".js" : "";

  return {
    name: "transform-runtime",

    inherits: injectCoreJS2
      ? createCorejsPlgin(
          pluginCorejs2,
          {
            method: "usage-pure",
            [pluginsCompat]: {
              runtimeVersion,
              useBabelRuntime: modulePath,
              ext: corejsExt,
            },
          },
          createRegeneratorPlugin({
            method: "usage-pure",
            [pluginsCompat]: { useBabelRuntime: modulePath },
          }),
        )
      : injectCoreJS3
      ? createCorejsPlgin(
          pluginCorejs3,
          {
            method: "usage-pure",
            version: 3,
            proposals,
            [pluginsCompat]: { useBabelRuntime: modulePath, ext: corejsExt },
          },
          createRegeneratorPlugin({
            method: "usage-pure",
            [pluginsCompat]: { useBabelRuntime: modulePath },
          }),
        )
      : createRegeneratorPlugin({
          method: "usage-pure",
          [pluginsCompat]: { useBabelRuntime: modulePath },
        }),

    pre(file) {
      if (!useRuntimeHelpers) return;

      file.set("helperGenerator", name => {
        // If the helper didn't exist yet at the version given, we bail
        // out and let Babel either insert it directly, or throw an error
        // so that plugins can handle that case properly.
        if (
          file.availableHelper &&
          !file.availableHelper(name, runtimeVersion)
        ) {
          return;
        }

        const isInteropHelper = HEADER_HELPERS.indexOf(name) !== -1;

        // Explicitly set the CommonJS interop helpers to their reserve
        // blockHoist of 4 so they are guaranteed to exist
        // when other things used them to import.
        const blockHoist =
          isInteropHelper && !isModule(file.path) ? 4 : undefined;

        const helpersDir =
          esModules && file.path.node.sourceType === "module"
            ? "helpers/esm"
            : "helpers";

        return addDefaultImport(
          `${modulePath}/${helpersDir}/${name}`,
          name,
          blockHoist,
          true,
        );
      });

      const cache = new Map();

      function addDefaultImport(
        source,
        nameHint,
        blockHoist,
        isHelper = false,
      ) {
        // If something on the page adds a helper when the file is an ES6
        // file, we can't reused the cached helper name after things have been
        // transformed because it has almost certainly been renamed.
        const cacheKey = isModule(file.path);
        const key = `${source}:${nameHint}:${cacheKey || ""}`;

        let cached = cache.get(key);
        if (cached) {
          cached = t.cloneNode(cached);
        } else {
          cached = addDefault(file.path, source, {
            importedInterop:
              isHelper && supportsCJSDefault ? "compiled" : "uncompiled",
            nameHint,
            blockHoist,
          });

          cache.set(key, cached);
        }
        return cached;
      }
    },
  };
});
