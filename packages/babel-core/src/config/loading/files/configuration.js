// @flow

import path from "path";
import fs from "fs";
import json5 from "json5";
import resolve from "resolve";
import { getEnv } from "../../helpers/environment";
import { makeStrongCache } from "../../caching";

type ConfigFile = {
  filepath: string,
  dirname: string,
  options: {},
};

const BABELRC_FILENAME = ".babelrc";
const BABELRC_JS_FILENAME = ".babelrc.js";
const PACKAGE_FILENAME = "package.json";
const BABELIGNORE_FILENAME = ".babelignore";

export function findConfigs(dirname: string): Array<ConfigFile> {
  let foundConfig = false;
  let foundIgnore = false;

  const confs = [];

  let loc = dirname;
  while (true) {
    if (!foundIgnore) {
      const ignoreLoc = path.join(loc, BABELIGNORE_FILENAME);
      const ignore = readIgnoreConfig(ignoreLoc);

      if (ignore) {
        confs.push(ignore);
        foundIgnore = true;
      }
    }

    if (!foundConfig) {
      const conf = [
        BABELRC_FILENAME,
        BABELRC_JS_FILENAME,
        PACKAGE_FILENAME,
      ].reduce((previousConfig: ConfigFile | null, name) => {
        const filepath = path.join(loc, name);
        const config = readConfig(filepath);

        if (config && previousConfig) {
          throw new Error(
            `Multiple configuration files found. Please remove one:\n- ${path.basename(
              previousConfig.filepath,
            )}\n- ${name}\nfrom ${loc}`,
          );
        }

        return config || previousConfig;
      }, null);

      if (conf) {
        confs.push(conf);
        foundConfig = true;
      }
    }

    if (foundIgnore && foundConfig) break;

    if (loc === path.dirname(loc)) break;

    loc = path.dirname(loc);
  }

  return confs;
}

export function loadConfig(name: string, dirname: string): ConfigFile {
  const filepath = resolve.sync(name, { basedir: dirname });

  const conf = readConfig(filepath);
  if (!conf) {
    throw new Error(`Config file ${filepath} contains no configuration data`);
  }

  return conf;
}

/**
 * Read the given config file, returning the result. Returns null if no config was found, but will
 * throw if there are parsing errors while loading a config.
 */
function readConfig(filepath) {
  return path.extname(filepath) === ".js"
    ? readConfigJS(filepath)
    : readConfigFile(filepath);
}

const readConfigJS = makeStrongCache((filepath, cache) => {
  if (!fs.existsSync(filepath)) {
    cache.forever();
    return null;
  }

  let options;
  try {
    // $FlowIssue
    const configModule = (require(filepath): mixed);
    options =
      configModule && configModule.__esModule
        ? configModule.default || undefined
        : configModule;
  } catch (err) {
    err.message = `${filepath}: Error while loading config - ${err.message}`;
    throw err;
  }

  if (typeof options === "function") {
    options = options({
      cache,
      // Expose ".env()" so people can easily get the same env that we expose using the "env" key.
      env: () => cache.using(() => getEnv()),
    });
  } else {
    cache.forever();
  }

  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new Error(
      `${filepath}: Configuration should be an exported JavaScript object.`,
    );
  }

  return {
    filepath,
    dirname: path.dirname(filepath),
    options,
  };
}, false /* autoPermacache */);

const readConfigFile = makeStaticFileCache((filepath, content) => {
  let options;
  if (path.basename(filepath) === PACKAGE_FILENAME) {
    try {
      options = JSON.parse(content).babel;
    } catch (err) {
      err.message = `${filepath}: Error while parsing JSON - ${err.message}`;
      throw err;
    }
    if (!options) return null;
  } else {
    try {
      options = json5.parse(content);
    } catch (err) {
      err.message = `${filepath}: Error while parsing config - ${err.message}`;
      throw err;
    }

    if (!options) throw new Error(`${filepath}: No config detected`);
  }

  if (typeof options !== "object") {
    throw new Error(`${filepath}: Config returned typeof ${typeof options}`);
  }
  if (Array.isArray(options)) {
    throw new Error(`${filepath}: Expected config object but found array`);
  }

  return {
    filepath,
    dirname: path.dirname(filepath),
    options,
  };
});

const readIgnoreConfig = makeStaticFileCache((filepath, content) => {
  const ignore = content
    .split("\n")
    .map(line => line.replace(/#(.*?)$/, "").trim())
    .filter(line => !!line);

  return {
    filepath,
    dirname: path.dirname(filepath),
    options: { ignore },
  };
});

function makeStaticFileCache<T>(fn: (string, string) => T): string => T | null {
  return makeStrongCache((filepath, cache) => {
    if (cache.invalidate(() => fileMtime(filepath)) === null) {
      cache.forever();
      return null;
    }

    return fn(filepath, fs.readFileSync(filepath, "utf8"));
  });
}

function fileMtime(filepath: string): number | null {
  try {
    return +fs.statSync(filepath).mtime;
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }

  return null;
}
