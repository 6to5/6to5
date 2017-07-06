// @flow

/**
 * This file handles all logic for converting string-based configuration references into loaded objects.
 */

import resolve from "resolve";
import path from "path";

const EXACT_RE = /^module:/;
const BABEL_PLUGIN_PREFIX_RE = /^(?!@|module:|[^/\/]+[/\/]|babel-plugin-)/;
const BABEL_PRESET_PREFIX_RE = /^(?!@|module:|[^/\/]+[/\/]|babel-preset-)/;
const BABEL_PLUGIN_ORG_RE = /^(@babel[/\/])(?!plugin-|[^/\/]+[/\/])/;
const BABEL_PRESET_ORG_RE = /^(@babel[/\/])(?!preset-|[^/\/]+[/\/])/;
const OTHER_PLUGIN_ORG_RE = /^(@(?!babel[/\/])[^/\/]+[/\/])(?!babel-plugin-|[^/\/]+[/\/])/;
const OTHER_PRESET_ORG_RE = /^(@(?!babel[/\/])[^/\/]+[/\/])(?!babel-preset-|[^/\/]+[/\/])/;

export function resolvePlugin(name: string, dirname: string): string | null {
  return resolveStandardizedName("plugin", name, dirname);
}

export function resolvePreset(name: string, dirname: string): string | null {
  return resolveStandardizedName("preset", name, dirname);
}

export function loadPlugin(
  name: string,
  dirname: string,
): { filepath: string, value: mixed } {
  const filepath = resolvePlugin(name, dirname);
  if (!filepath) {
    throw new Error(`Plugin ${name} not found relative to ${dirname}`);
  }

  return {
    filepath,
    value: requireModule(filepath),
  };
}

export function loadPreset(
  name: string,
  dirname: string,
): { filepath: string, value: mixed } {
  const filepath = resolvePreset(name, dirname);
  if (!filepath) {
    throw new Error(`Preset ${name} not found relative to ${dirname}`);
  }

  return {
    filepath,
    value: requireModule(filepath),
  };
}

export function loadParser(
  name: string,
  dirname: string,
): { filepath: string, value: Function } {
  const filepath = resolve.sync(name, { basedir: dirname });

  const mod = requireModule(filepath);

  if (!mod) {
    throw new Error(
      `Parser ${name} relative to ${dirname} does not export an object`,
    );
  }
  if (typeof mod.parse !== "function") {
    throw new Error(
      `Parser ${name} relative to ${dirname} does not export a .parse function`,
    );
  }

  return {
    filepath,
    value: mod.parse,
  };
}

export function loadGenerator(
  name: string,
  dirname: string,
): { filepath: string, value: Function } {
  const filepath = resolve.sync(name, { basedir: dirname });

  const mod = requireModule(filepath);

  if (!mod) {
    throw new Error(
      `Generator ${name} relative to ${dirname} does not export an object`,
    );
  }
  if (typeof mod.print !== "function") {
    throw new Error(
      `Generator ${name} relative to ${dirname} does not export a .print function`,
    );
  }

  return {
    filepath,
    value: mod.print,
  };
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
    return resolve.sync(standardizedName, { basedir: dirname });
  } catch (e) {
    if (e.code !== "MODULE_NOT_FOUND") throw e;

    if (standardizedName !== name) {
      let resolvedOriginal = false;
      try {
        resolve.sync(name, { basedir: dirname });
        resolvedOriginal = true;
      } catch (e2) {}

      if (resolvedOriginal) {
        // eslint-disable-next-line max-len
        e.message += `\n- If you want to resolve "${name}", use "module:${name}"`;
      }
    }

    let resolvedBabel = false;
    try {
      resolve.sync(standardizeName(type, "@babel/" + name), {
        basedir: dirname,
      });
      resolvedBabel = true;
    } catch (e2) {}

    if (resolvedBabel) {
      // eslint-disable-next-line max-len
      e.message += `\n- Did you mean "@babel/${name}"?`;
    }

    let resolvedOppositeType = false;
    const oppositeType = type === "preset" ? "plugin" : "preset";
    try {
      resolve.sync(standardizeName(oppositeType, name), { basedir: dirname });
      resolvedOppositeType = true;
    } catch (e2) {}

    if (resolvedOppositeType) {
      // eslint-disable-next-line max-len
      e.message += `\n- Did you accidentally pass a ${type} as a ${oppositeType}?`;
    }

    throw e;
  }
}

function requireModule(name: string): mixed {
  // $FlowIssue
  return require(name);
}
