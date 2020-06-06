// @flow

import buildDebug from "debug";
import path from "path";
import json5 from "json5";
import gensync, { type Handler } from "gensync";
import {
  makeStrongCache,
  makeWeakCacheSync,
  type CacheConfigurator,
} from "../caching";
import makeAPI, { type PluginAPI } from "../helpers/config-api";
import { makeStaticFileCache } from "./utils";
import loadCjsOrMjsDefault from "./module-types";
import pathPatternToRegex from "../pattern-to-regex";
import type { FilePackageData, RelativeConfig, ConfigFile } from "./types";
import type { CallerMetadata } from "../validation/options";

import * as fs from "../../gensync-utils/fs";
import resolve from "../../gensync-utils/resolve";

import { endHiddenCallStack } from "../../errors/rewrite-stack-trace";
import ConfigError from "../../errors/config-error";

const debug = buildDebug("babel:config:loading:files:configuration");

export const ROOT_CONFIG_FILENAMES = [
  "babel.config.js",
  "babel.config.cjs",
  "babel.config.mjs",
  "babel.config.json",
];
const RELATIVE_CONFIG_FILENAMES = [
  ".babelrc",
  ".babelrc.js",
  ".babelrc.cjs",
  ".babelrc.mjs",
  ".babelrc.json",
];

const BABELIGNORE_FILENAME = ".babelignore";

export function* findConfigUpwards(rootDir: string): Handler<string | null> {
  let dirname = rootDir;
  while (true) {
    for (const filename of ROOT_CONFIG_FILENAMES) {
      if (yield* fs.exists(path.join(dirname, filename))) {
        return dirname;
      }
    }

    const nextDir = path.dirname(dirname);
    if (dirname === nextDir) break;
    dirname = nextDir;
  }

  return null;
}

export function* findRelativeConfig(
  packageData: FilePackageData,
  envName: string,
  caller: CallerMetadata | void,
): Handler<RelativeConfig> {
  let config = null;
  let ignore = null;

  const dirname = path.dirname(packageData.filepath);

  for (const loc of packageData.directories) {
    if (!config) {
      config = yield* loadOneConfig(
        RELATIVE_CONFIG_FILENAMES,
        loc,
        envName,
        caller,
        packageData.pkg?.dirname === loc
          ? // $FlowIgnore - packageData.pkg is not null
            packageToBabelConfig((packageData.pkg: ConfigFile))
          : null,
      );
    }

    if (!ignore) {
      const ignoreLoc = path.join(loc, BABELIGNORE_FILENAME);
      ignore = yield* readIgnoreConfig(ignoreLoc);

      if (ignore) {
        debug("Found ignore %o from %o.", ignore.filepath, dirname);
      }
    }
  }

  return { config, ignore };
}

export function findRootConfig(
  dirname: string,
  envName: string,
  caller: CallerMetadata | void,
): Handler<ConfigFile | null> {
  return loadOneConfig(ROOT_CONFIG_FILENAMES, dirname, envName, caller);
}

function* loadOneConfig(
  names: string[],
  dirname: string,
  envName: string,
  caller: CallerMetadata | void,
  previousConfig?: ConfigFile | null = null,
): Handler<ConfigFile | null> {
  const configs = yield* gensync.all(
    names.map(filename =>
      readConfig(path.join(dirname, filename), envName, caller),
    ),
  );
  const config = configs.reduce((previousConfig: ConfigFile | null, config) => {
    if (config && previousConfig) {
      throw new ConfigError(
        `Multiple configuration files found. Please remove one:\n` +
          ` - ${path.basename(previousConfig.filepath)}\n` +
          ` - ${config.filepath}\n` +
          `from ${dirname}`,
      );
    }

    return config || previousConfig;
  }, previousConfig);

  if (config) {
    debug("Found configuration %o from %o.", config.filepath, dirname);
  }
  return config;
}

export function* loadConfig(
  name: string,
  dirname: string,
  envName: string,
  caller: CallerMetadata | void,
): Handler<ConfigFile> {
  const filepath = yield* resolve(name, { basedir: dirname });

  const conf = yield* readConfig(filepath, envName, caller);
  if (!conf) {
    throw new ConfigError(
      `Config file contains no configuration data`,
      filepath,
    );
  }

  debug("Loaded config %o from %o.", name, dirname);
  return conf;
}

/**
 * Read the given config file, returning the result. Returns null if no config was found, but will
 * throw if there are parsing errors while loading a config.
 */
function readConfig(filepath, envName, caller) {
  const ext = path.extname(filepath);
  return ext === ".js" || ext === ".cjs" || ext === ".mjs"
    ? readConfigJS(filepath, { envName, caller })
    : readConfigJSON5(filepath);
}

const LOADING_CONFIGS = new Set();

const readConfigJS = makeStrongCache(function* readConfigJS(
  filepath: string,
  cache: CacheConfigurator<{
    envName: string,
    caller: CallerMetadata | void,
  }>,
): Handler<ConfigFile | null> {
  if (!fs.exists.sync(filepath)) {
    cache.forever();
    return null;
  }

  // The `require()` call below can make this code reentrant if a require hook like @babel/register has been
  // loaded into the system. That would cause Babel to attempt to compile the `.babelrc.js` file as it loads
  // below. To cover this case, we auto-ignore re-entrant config processing.
  if (LOADING_CONFIGS.has(filepath)) {
    cache.never();

    debug("Auto-ignoring usage of config %o.", filepath);
    return {
      filepath,
      dirname: path.dirname(filepath),
      options: {},
    };
  }

  let options: mixed;
  try {
    LOADING_CONFIGS.add(filepath);
    options = (yield* loadCjsOrMjsDefault(
      filepath,
      "You appear to be using a native ECMAScript module configuration " +
        "file, which is only supported when running Babel asynchronously.",
    ): mixed);
  } finally {
    LOADING_CONFIGS.delete(filepath);
  }

  let assertCache = false;
  if (typeof options === "function") {
    yield* []; // if we want to make it possible to use async configs
    options = endHiddenCallStack(((options: any): (api: PluginAPI) => {}))(
      makeAPI(cache),
    );

    assertCache = true;
  }

  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new ConfigError(
      `Configuration should be an exported JavaScript object.`,
      filepath,
    );
  }

  if (typeof options.then === "function") {
    throw new ConfigError(
      `You appear to be using an async configuration, ` +
        `which your current version of Babel does not support. ` +
        `We may add support for this in the future, ` +
        `but if you're on the most recent version of @babel/core and still ` +
        `seeing this error, then you'll need to synchronously return your config.`,
      filepath,
    );
  }

  if (assertCache && !cache.configured()) throwCacheError(filepath);

  return {
    filepath,
    dirname: path.dirname(filepath),
    options,
  };
});

const packageToBabelConfig = makeWeakCacheSync(
  (file: ConfigFile): ConfigFile | null => {
    const babel = file.options[("babel": string)];

    if (typeof babel === "undefined") return null;

    if (typeof babel !== "object" || Array.isArray(babel) || babel === null) {
      throw new ConfigError(`.babel property must be an object`, file.filepath);
    }

    return {
      filepath: file.filepath,
      dirname: file.dirname,
      options: babel,
    };
  },
);

const readConfigJSON5 = makeStaticFileCache((filepath, content) => {
  let options;
  try {
    options = json5.parse(content);
  } catch (err) {
    throw new ConfigError(
      `Error while parsing config - ${err.message}`,
      filepath,
    );
  }

  if (!options) throw new ConfigError(`No config detected`, filepath);

  if (typeof options !== "object") {
    throw new ConfigError(`Config returned typeof ${typeof options}`, filepath);
  }
  if (Array.isArray(options)) {
    throw new ConfigError(`Expected config object but found array`, filepath);
  }

  return {
    filepath,
    dirname: path.dirname(filepath),
    options,
  };
});

const readIgnoreConfig = makeStaticFileCache((filepath, content) => {
  const ignoreDir = path.dirname(filepath);
  const ignorePatterns = content
    .split("\n")
    .map(line => line.replace(/#(.*?)$/, "").trim())
    .filter(line => !!line);

  for (const pattern of ignorePatterns) {
    if (pattern[0] === "!") {
      throw new ConfigError(
        `Negation of file paths is not supported.`,
        filepath,
      );
    }
  }

  return {
    filepath,
    dirname: path.dirname(filepath),
    ignore: ignorePatterns.map(pattern =>
      pathPatternToRegex(pattern, ignoreDir),
    ),
  };
});

function throwCacheError(filepath) {
  throw new ConfigError(
    `\
Caching was left unconfigured. Babel's plugins, presets, and configuration files can be configured
for various types of caching, using the first param of their handler functions:

module.exports = function(api) {
  // The API exposes the following:

  // Cache the returned value forever and don't call this function again.
  api.cache(true);

  // Don't cache at all. Not recommended because it will be very slow.
  api.cache(false);

  // Cached based on the value of some function. If this function returns a value different from
  // a previously-encountered value, the plugins will re-evaluate.
  var env = api.cache(() => process.env.NODE_ENV);

  // If testing for a specific env, we recommend specifics to avoid instantiating a plugin for
  // any possible NODE_ENV value that might come up during plugin execution.
  var isProd = api.cache(() => process.env.NODE_ENV === "production");

  // .cache(fn) will perform a linear search though instances to find the matching plugin based
  // based on previous instantiated plugins. If you want to recreate the plugin and discard the
  // previous instance whenever something changes, you may use:
  var isProd = api.cache.invalidate(() => process.env.NODE_ENV === "production");

  // Note, we also expose the following more-verbose versions of the above examples:
  api.cache.forever(); // api.cache(true)
  api.cache.never();   // api.cache(false)
  api.cache.using(fn); // api.cache(fn)

  // Return the value that will be cached.
  return { };
};`,
    filepath,
  );
}
