/**
 * Entry point for @babel/standalone. This wraps Babel's API in a version that's
 * friendlier for use in web browsers. It removes the automagical detection of
 * plugins, instead explicitly registering all the available plugins and
 * presets, and requiring custom ones to be registered through `registerPlugin`
 * and `registerPreset` respectively.
 * @flow
 */

/* global VERSION */
/* eslint-disable max-len */

import {
  transformFromAst as babelTransformFromAst,
  transform as babelTransform,
  buildExternalHelpers as babelBuildExternalHelpers,
} from "@babel/core";
import { all } from "./generated/plugins";
import preset2015 from "./preset-es2015";
import presetStage0 from "./preset-stage-0";
import presetStage1 from "./preset-stage-1";
import presetStage2 from "./preset-stage-2";
import presetStage3 from "./preset-stage-3";
import presetEnv from "@babel/preset-env";
import presetFlow from "@babel/preset-flow";
import presetReact from "@babel/preset-react";
import presetTypescript from "@babel/preset-typescript";

import { runScripts } from "./transformScriptTags";

const isArray =
  Array.isArray ||
  (arg => Object.prototype.toString.call(arg) === "[object Array]");

/**
 * Loads the given name (or [name, options] pair) from the given table object
 * holding the available presets or plugins.
 *
 * Returns undefined if the preset or plugin is not available; passes through
 * name unmodified if it (or the first element of the pair) is not a string.
 */
function loadBuiltin(builtinTable, name) {
  if (isArray(name) && typeof name[0] === "string") {
    if (Object.prototype.hasOwnProperty.call(builtinTable, name[0])) {
      return [builtinTable[name[0]]].concat(name.slice(1));
    }
    return;
  } else if (typeof name === "string") {
    return builtinTable[name];
  }
  // Could be an actual preset/plugin module
  return name;
}

/**
 * Parses plugin names and presets from the specified options.
 */
function processOptions(options) {
  // Parse preset names
  const presets = (options.presets || []).map(presetName => {
    const preset = loadBuiltin(availablePresets, presetName);

    if (preset) {
      // workaround for babel issue
      // at some point, babel copies the preset, losing the non-enumerable
      // buildPreset key; convert it into an enumerable key.
      if (
        isArray(preset) &&
        typeof preset[0] === "object" &&
        Object.prototype.hasOwnProperty.call(preset[0], "buildPreset")
      ) {
        preset[0] = { ...preset[0], buildPreset: preset[0].buildPreset };
      }
    } else {
      throw new Error(
        `Invalid preset specified in Babel options: "${presetName}"`,
      );
    }
    return preset;
  });

  // Parse plugin names
  const plugins = (options.plugins || []).map(pluginName => {
    const plugin = loadBuiltin(availablePlugins, pluginName);

    if (!plugin) {
      throw new Error(
        `Invalid plugin specified in Babel options: "${pluginName}"`,
      );
    }
    return plugin;
  });

  return {
    babelrc: false,
    ...options,
    presets,
    plugins,
  };
}

export { parser, traverse, template, generate, types } from "@babel/core";

export function transform(code: string, options: Object) {
  return babelTransform(code, processOptions(options));
}

export function transformFromAst(ast: Object, code: string, options: Object) {
  return babelTransformFromAst(ast, code, processOptions(options));
}
export const availablePlugins = {};
export const availablePresets = {};
export const buildExternalHelpers = babelBuildExternalHelpers;
/**
 * Registers a named plugin for use with Babel.
 */
export function registerPlugin(name: string, plugin: Object | Function): void {
  if (Object.prototype.hasOwnProperty.call(availablePlugins, name)) {
    console.warn(
      `A plugin named "${name}" is already registered, it will be overridden`,
    );
  }
  availablePlugins[name] = plugin;
}
/**
 * Registers multiple plugins for use with Babel. `newPlugins` should be an object where the key
 * is the name of the plugin, and the value is the plugin itself.
 */
export function registerPlugins(newPlugins: {
  [string]: Object | Function,
}): void {
  Object.keys(newPlugins).forEach(name =>
    registerPlugin(name, newPlugins[name]),
  );
}

/**
 * Registers a named preset for use with Babel.
 */
export function registerPreset(name: string, preset: Object | Function): void {
  if (Object.prototype.hasOwnProperty.call(availablePresets, name)) {
    if (name === "env") {
      console.warn(
        "@babel/preset-env is now included in @babel/standalone, please remove @babel/preset-env-standalone",
      );
    } else {
      console.warn(
        `A preset named "${name}" is already registered, it will be overridden`,
      );
    }
  }
  availablePresets[name] = preset;
}
/**
 * Registers multiple presets for use with Babel. `newPresets` should be an object where the key
 * is the name of the preset, and the value is the preset itself.
 */
export function registerPresets(newPresets: {
  [string]: Object | Function,
}): void {
  Object.keys(newPresets).forEach(name =>
    registerPreset(name, newPresets[name]),
  );
}

// All the plugins we should bundle
// Want to get rid of this long whitelist of plugins?
// Wait! Please read https://github.com/babel/babel/pull/6177 first.
registerPlugins(all);

// All the presets we should bundle
// Want to get rid of this whitelist of presets?
// Wait! Please read https://github.com/babel/babel/pull/6177 first.
registerPresets({
  env: presetEnv,
  es2015: preset2015,
  es2016: () => {
    return {
      plugins: [availablePlugins["transform-exponentiation-operator"]],
    };
  },
  es2017: () => {
    return {
      plugins: [availablePlugins["transform-async-to-generator"]],
    };
  },
  react: presetReact,
  "stage-0": presetStage0,
  "stage-1": presetStage1,
  "stage-2": presetStage2,
  "stage-3": presetStage3,
  "es2015-loose": {
    presets: [[preset2015, { loose: true }]],
  },
  // ES2015 preset with es2015-modules-commonjs removed
  "es2015-no-commonjs": {
    presets: [[preset2015, { modules: false }]],
  },
  typescript: presetTypescript,
  flow: presetFlow,
});

// $FlowIgnore
export const version = VERSION;

function onDOMContentLoaded() {
  transformScriptTags();
}

// Listen for load event if we're in a browser and then kick off finding and
// running of scripts with "text/babel" type.
if (typeof window !== "undefined" && window?.addEventListener) {
  window.addEventListener("DOMContentLoaded", onDOMContentLoaded, false);
}

/**
 * Transform <script> tags with "text/babel" type.
 * @param {Array} scriptTags specify script tags to transform, transform all in the <head> if not given
 */
export function transformScriptTags(scriptTags?: Array<any>) {
  runScripts(transform, scriptTags);
}

/**
 * Disables automatic transformation of <script> tags with "text/babel" type.
 */
export function disableScriptTags() {
  window.removeEventListener("DOMContentLoaded", onDOMContentLoaded);
}
