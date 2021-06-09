/**
 * This file handles all logic for converting string-based configuration references into loaded objects.
 */

import buildDebug from "debug";
import path from "path";
import type { Handler } from "gensync";
import loadCjsOrMjsDefault from "./module-types";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const debug = buildDebug("babel:config:loading:files:plugins");

const EXACT_RE = /^module:/;
const BABEL_PLUGIN_PREFIX_RE = /^(?!@|module:|[^/]+\/|babel-plugin-)/;
const BABEL_PRESET_PREFIX_RE = /^(?!@|module:|[^/]+\/|babel-preset-)/;
const BABEL_PLUGIN_ORG_RE = /^(@babel\/)(?!plugin-|[^/]+\/)/;
const BABEL_PRESET_ORG_RE = /^(@babel\/)(?!preset-|[^/]+\/)/;
const OTHER_PLUGIN_ORG_RE =
  /^(@(?!babel\/)[^/]+\/)(?![^/]*babel-plugin(?:-|\/|$)|[^/]+\/)/;
const OTHER_PRESET_ORG_RE =
  /^(@(?!babel\/)[^/]+\/)(?![^/]*babel-preset(?:-|\/|$)|[^/]+\/)/;
const OTHER_ORG_DEFAULT_RE = /^(@(?!babel$)[^/]+)$/;

export function resolvePlugin(name: string, dirname: string): string | null {
  return resolveStandardizedName("plugin", name, dirname);
}

export function resolvePreset(name: string, dirname: string): string | null {
  return resolveStandardizedName("preset", name, dirname);
}

export function* loadPlugin(
  name: string,
  dirname: string,
): Handler<{ filepath: string; value: unknown }> {
  const filepath = resolvePlugin(name, dirname);
  if (!filepath) {
    throw new Error(`Plugin ${name} not found relative to ${dirname}`);
  }

  const value = yield* requireModule("plugin", filepath);
  debug("Loaded plugin %o from %o.", name, dirname);

  return { filepath, value };
}

export function* loadPreset(
  name: string,
  dirname: string,
): Handler<{ filepath: string; value: unknown }> {
  const filepath = resolvePreset(name, dirname);
  if (!filepath) {
    throw new Error(`Preset ${name} not found relative to ${dirname}`);
  }

  const value = yield* requireModule("preset", filepath);

  debug("Loaded preset %o from %o.", name, dirname);

  return { filepath, value };
}

function standardizeName(type: "plugin" | "preset", name: string) {
  // Let absolute and relative paths through.
  if (path.isAbsolute(name)) return name;

  const isPreset = type === "preset";

  return (
    name
      // foo -> babel-preset-foo
      .replace(
        isPreset ? BABEL_PRESET_PREFIX_RE : BABEL_PLUGIN_PREFIX_RE,
        `babel-${type}-`,
      )
      // @babel/es2015 -> @babel/preset-es2015
      .replace(
        isPreset ? BABEL_PRESET_ORG_RE : BABEL_PLUGIN_ORG_RE,
        `$1${type}-`,
      )
      // @foo/mypreset -> @foo/babel-preset-mypreset
      .replace(
        isPreset ? OTHER_PRESET_ORG_RE : OTHER_PLUGIN_ORG_RE,
        `$1babel-${type}-`,
      )
      // @foo -> @foo/babel-preset
      .replace(OTHER_ORG_DEFAULT_RE, `$1/babel-${type}`)
      // module:mypreset -> mypreset
      .replace(EXACT_RE, "")
  );
}

function resolveStandardizedName(
  type: "plugin" | "preset",
  name: string,
  dirname: string = process.cwd(),
) {
  const standardizedName = standardizeName(type, name);

  try {
    return require.resolve(standardizedName, {
      paths: [dirname],
    });
  } catch (e) {
    if (e.code !== "MODULE_NOT_FOUND") throw e;

    if (standardizedName !== name) {
      let resolvedOriginal = false;
      try {
        require.resolve(name, {
          paths: [dirname],
        });
        resolvedOriginal = true;
      } catch {}

      if (resolvedOriginal) {
        e.message += `\n- If you want to resolve "${name}", use "module:${name}"`;
      }
    }

    let resolvedBabel = false;
    try {
      require.resolve(standardizeName(type, "@babel/" + name), {
        paths: [dirname],
      });
      resolvedBabel = true;
    } catch {}

    if (resolvedBabel) {
      e.message += `\n- Did you mean "@babel/${name}"?`;
    }

    let resolvedOppositeType = false;
    const oppositeType = type === "preset" ? "plugin" : "preset";
    try {
      require.resolve(standardizeName(oppositeType, name), {
        paths: [dirname],
      });
      resolvedOppositeType = true;
    } catch {}

    if (resolvedOppositeType) {
      e.message += `\n- Did you accidentally pass a ${oppositeType} as a ${type}?`;
    }

    throw e;
  }
}

const LOADING_MODULES = new Set();
function* requireModule(type: string, name: string): Handler<unknown> {
  if (LOADING_MODULES.has(name)) {
    // TODO: This causes problems with async plugins
    /*throw new Error(
      `Reentrant ${type} detected trying to load "${name}". This module is not ignored ` +
        "and is trying to load itself while compiling itself, leading to a dependency cycle. " +
        'We recommend adding it to your "ignore" list in your babelrc, or to a .babelignore.',
    );*/
  }

  try {
    LOADING_MODULES.add(name);
    return yield* loadCjsOrMjsDefault(
      name,
      `You appear to be using a native ECMAScript module ${type}, ` +
        "which is only supported when running Babel asynchronously.",
      // For backward compatiblity, we need to support malformed presets
      // defined as separate named exports rather than a single default
      // export.
      // See packages/babel-core/test/fixtures/option-manager/presets/es2015_named.js
      true,
    );
  } catch (err) {
    err.message = `[BABEL]: ${err.message} (While processing: ${name})`;
    throw err;
  } finally {
    LOADING_MODULES.delete(name);
  }
}
