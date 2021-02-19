"use strict";

const sourceMapSupport = require("source-map-support");
const { addHook } = require("pirates");
const fs = require("fs");
const path = require("path");
const { DEFAULT_EXTENSIONS } = require("@babel/core");

const escapeRegExp = require("../escape-regexp.cjs");
const registerCache = require("../cache");
const worker = require("./worker-interface.cjs");

const maps = {};
let transformOpts = {};
let piratesRevert = null;

function installSourceMapSupport() {
  sourceMapSupport.install({
    handleUncaughtExceptions: false,
    environment: "node",
    retrieveSourceMap(source) {
      const map = maps && maps[source];
      if (map) {
        return {
          url: null,
          map: map,
        };
      } else {
        return null;
      }
    },
  });
}

let cache;

function mtime(filename) {
  return +fs.statSync(filename).mtime;
}

function compile(code, filename) {
  // merge in base options and resolve all the plugins and presets relative to this file

  const ref = worker.loadOptions(filename, transformOpts);

  // Bail out ASAP if the file has been ignored.
  if (!ref) return code;

  const { cacheKey, optionsId } = ref;

  let cached = cache && cache[cacheKey];

  if (!cached || cached.mtime !== mtime(filename)) {
    cached = worker.compile(code, optionsId);

    if (cache) {
      cache[cacheKey] = cached;
      cached.mtime = mtime(filename);
      registerCache.setDirty();
    }
  }

  if (cached.map) {
    if (Object.keys(maps).length === 0) {
      installSourceMapSupport();
    }
    maps[filename] = cached.map;
  }

  return cached.code;
}

function hookExtensions(exts) {
  if (piratesRevert) piratesRevert();
  piratesRevert = addHook(compile, { exts, ignoreNodeModules: false });
}

exports.revert = function revert() {
  if (piratesRevert) piratesRevert();
};

exports.register = function register(opts?: Object = {}) {
  // Clone to avoid mutating the arguments object with the 'delete's below.
  opts = {
    ...opts,
  };
  hookExtensions(opts.extensions || DEFAULT_EXTENSIONS);

  if (opts.cache === false && cache) {
    registerCache.clear();
    cache = null;
  } else if (opts.cache !== false && !cache) {
    registerCache.load();
    cache = registerCache.get();
  }

  delete opts.extensions;
  delete opts.cache;

  transformOpts = {
    ...opts,
    caller: {
      name: "@babel/register",
      ...(opts.caller || {}),
    },
  };

  let { cwd = "." } = transformOpts;

  // Ensure that the working directory is resolved up front so that
  // things don't break if it changes later.
  cwd = transformOpts.cwd = path.resolve(cwd);

  if (transformOpts.ignore === undefined && transformOpts.only === undefined) {
    transformOpts.only = [
      // Only compile things inside the current working directory.
      // $FlowIgnore
      new RegExp("^" + escapeRegExp(cwd), "i"),
    ];
    transformOpts.ignore = [
      // Ignore any node_modules inside the current working directory.
      new RegExp(
        "^" +
          // $FlowIgnore
          escapeRegExp(cwd) +
          "(?:" +
          path.sep +
          ".*)?" +
          // $FlowIgnore
          escapeRegExp(path.sep + "node_modules" + path.sep),
        "i"
      ),
    ];
  }
};
