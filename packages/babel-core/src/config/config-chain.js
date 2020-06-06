// @flow

import path from "path";
import buildDebug from "debug";
import type { Handler } from "gensync";
import {
  validate,
  type ValidatedOptions,
  type IgnoreList,
  type ConfigApplicableTest,
  type BabelrcSearch,
  type CallerMetadata,
} from "./validation/options";
import pathPatternToRegex from "./pattern-to-regex";

import { endHiddenCallStack } from "../errors/rewrite-stack-trace";
import ConfigError from "../errors/config-error";

const debug = buildDebug("babel:config:config-chain");

import {
  findPackageData,
  findRelativeConfig,
  findRootConfig,
  loadConfig,
  type ConfigFile,
  type IgnoreFile,
  type FilePackageData,
} from "./files";

import { makeWeakCacheSync, makeStrongCacheSync } from "./caching";

import {
  createCachedDescriptors,
  createUncachedDescriptors,
  type UnloadedDescriptor,
  type OptionsAndDescriptors,
  type ValidatedFile,
} from "./config-descriptors";

export type ConfigChain = {
  plugins: Array<UnloadedDescriptor>,
  presets: Array<UnloadedDescriptor>,
  options: Array<ValidatedOptions>,
};

export type PresetInstance = {
  options: ValidatedOptions,
  alias: string,
  dirname: string,
};

export type ConfigContext = {
  filename: string | void,
  cwd: string,
  root: string,
  envName: string,
  caller: CallerMetadata | void,
};

/**
 * Build a config chain for a given preset.
 */
export function* buildPresetChain(
  arg: PresetInstance,
  context: *,
): Handler<ConfigChain | null> {
  const chain = yield* buildPresetChainWalker(arg, context);
  if (!chain) return null;

  return {
    plugins: dedupDescriptors(chain.plugins),
    presets: dedupDescriptors(chain.presets),
    options: chain.options.map(o => normalizeOptions(o)),
  };
}

export const buildPresetChainWalker: (
  arg: PresetInstance,
  context: *,
) => * = makeChainWalker({
  init: arg => arg,
  root: preset => loadPresetDescriptors(preset),
  env: (preset, envName) => loadPresetEnvDescriptors(preset)(envName),
  overrides: (preset, index) => loadPresetOverridesDescriptors(preset)(index),
  overridesEnv: (preset, index, envName) =>
    loadPresetOverridesEnvDescriptors(preset)(index)(envName),
});
const loadPresetDescriptors = makeWeakCacheSync((preset: PresetInstance) =>
  buildRootDescriptors(preset, preset.alias, createUncachedDescriptors),
);
const loadPresetEnvDescriptors = makeWeakCacheSync((preset: PresetInstance) =>
  makeStrongCacheSync((envName: string) =>
    buildEnvDescriptors(
      preset,
      preset.alias,
      createUncachedDescriptors,
      envName,
    ),
  ),
);
const loadPresetOverridesDescriptors = makeWeakCacheSync(
  (preset: PresetInstance) =>
    makeStrongCacheSync((index: number) =>
      buildOverrideDescriptors(
        preset,
        preset.alias,
        createUncachedDescriptors,
        index,
      ),
    ),
);
const loadPresetOverridesEnvDescriptors = makeWeakCacheSync(
  (preset: PresetInstance) =>
    makeStrongCacheSync((index: number) =>
      makeStrongCacheSync((envName: string) =>
        buildOverrideEnvDescriptors(
          preset,
          preset.alias,
          createUncachedDescriptors,
          index,
          envName,
        ),
      ),
    ),
);

export type RootConfigChain = ConfigChain & {
  babelrc: ConfigFile | void,
  config: ConfigFile | void,
  ignore: IgnoreFile | void,
};

/**
 * Build a config chain for Babel's full root configuration.
 */
export function* buildRootChain(
  opts: ValidatedOptions,
  context: ConfigContext,
): Handler<RootConfigChain | null> {
  const programmaticChain = yield* loadProgrammaticChain(
    {
      options: opts,
      dirname: context.cwd,
    },
    context,
  );
  if (!programmaticChain) return null;

  let configFile;
  if (typeof opts.configFile === "string") {
    configFile = yield* loadConfig(
      opts.configFile,
      context.cwd,
      context.envName,
      context.caller,
    );
  } else if (opts.configFile !== false) {
    configFile = yield* findRootConfig(
      context.root,
      context.envName,
      context.caller,
    );
  }

  let { babelrc, babelrcRoots } = opts;
  let babelrcRootsDirectory = context.cwd;

  const configFileChain = emptyChain();
  if (configFile) {
    const validatedFile = validateConfigFile(configFile);
    const result = yield* loadFileChain(validatedFile, context);
    if (!result) return null;

    // Allow config files to toggle `.babelrc` resolution on and off and
    // specify where the roots are.
    if (babelrc === undefined) {
      babelrc = validatedFile.options.babelrc;
    }
    if (babelrcRoots === undefined) {
      babelrcRootsDirectory = validatedFile.dirname;
      babelrcRoots = validatedFile.options.babelrcRoots;
    }

    mergeChain(configFileChain, result);
  }

  const pkgData =
    typeof context.filename === "string"
      ? yield* findPackageData(context.filename)
      : null;

  let ignoreFile, babelrcFile;
  const fileChain = emptyChain();
  // resolve all .babelrc files
  if (
    (babelrc === true || babelrc === undefined) &&
    pkgData &&
    babelrcLoadEnabled(context, pkgData, babelrcRoots, babelrcRootsDirectory)
  ) {
    ({ ignore: ignoreFile, config: babelrcFile } = yield* findRelativeConfig(
      pkgData,
      context.envName,
      context.caller,
    ));

    if (
      ignoreFile &&
      shouldIgnore(context, ignoreFile.ignore, null, ignoreFile.dirname)
    ) {
      return null;
    }

    if (babelrcFile) {
      const result = yield* loadFileChain(
        validateBabelrcFile(babelrcFile),
        context,
      );
      if (!result) return null;

      mergeChain(fileChain, result);
    }
  }

  // Insert file chain in front so programmatic options have priority
  // over configuration file chain items.
  const chain = mergeChain(
    mergeChain(mergeChain(emptyChain(), configFileChain), fileChain),
    programmaticChain,
  );

  return {
    plugins: dedupDescriptors(chain.plugins),
    presets: dedupDescriptors(chain.presets),
    options: chain.options.map(o => normalizeOptions(o)),
    ignore: ignoreFile || undefined,
    babelrc: babelrcFile || undefined,
    config: configFile || undefined,
  };
}

function babelrcLoadEnabled(
  context: ConfigContext,
  pkgData: FilePackageData,
  babelrcRoots: BabelrcSearch | void,
  babelrcRootsDirectory: string,
): boolean {
  if (typeof babelrcRoots === "boolean") return babelrcRoots;

  const absoluteRoot = context.root;

  // Fast path to avoid having to match patterns if the babelrc is just
  // loading in the standard root directory.
  if (babelrcRoots === undefined) {
    return pkgData.directories.indexOf(absoluteRoot) !== -1;
  }

  let babelrcPatterns = babelrcRoots;
  if (!Array.isArray(babelrcPatterns)) babelrcPatterns = [babelrcPatterns];
  babelrcPatterns = babelrcPatterns.map(pat => {
    return typeof pat === "string"
      ? path.resolve(babelrcRootsDirectory, pat)
      : pat;
  });

  // Fast path to avoid having to match patterns if the babelrc is just
  // loading in the standard root directory.
  if (babelrcPatterns.length === 1 && babelrcPatterns[0] === absoluteRoot) {
    return pkgData.directories.indexOf(absoluteRoot) !== -1;
  }

  return babelrcPatterns.some(pat => {
    if (typeof pat === "string") {
      pat = pathPatternToRegex(pat, babelrcRootsDirectory);
    }

    return pkgData.directories.some(directory => {
      return matchPattern(pat, babelrcRootsDirectory, directory, context);
    });
  });
}

const validateConfigFile = makeWeakCacheSync(
  (file: ConfigFile): ValidatedFile => ({
    filepath: file.filepath,
    dirname: file.dirname,
    options: validate("configfile", file.options, file.filepath),
  }),
);

const validateBabelrcFile = makeWeakCacheSync(
  (file: ConfigFile): ValidatedFile => ({
    filepath: file.filepath,
    dirname: file.dirname,
    options: validate("babelrcfile", file.options, file.filepath),
  }),
);

const validateExtendFile = makeWeakCacheSync(
  (file: ConfigFile): ValidatedFile => ({
    filepath: file.filepath,
    dirname: file.dirname,
    options: validate("extendsfile", file.options, file.filepath),
  }),
);

/**
 * Build a config chain for just the programmatic options passed into Babel.
 */
const loadProgrammaticChain = makeChainWalker({
  root: input => buildRootDescriptors(input, "base", createCachedDescriptors),
  env: (input, envName) =>
    buildEnvDescriptors(input, "base", createCachedDescriptors, envName),
  overrides: (input, index) =>
    buildOverrideDescriptors(input, "base", createCachedDescriptors, index),
  overridesEnv: (input, index, envName) =>
    buildOverrideEnvDescriptors(
      input,
      "base",
      createCachedDescriptors,
      index,
      envName,
    ),
});

/**
 * Build a config chain for a given file.
 */
const loadFileChain = makeChainWalker({
  root: file => loadFileDescriptors(file),
  env: (file, envName) => loadFileEnvDescriptors(file)(envName),
  overrides: (file, index) => loadFileOverridesDescriptors(file)(index),
  overridesEnv: (file, index, envName) =>
    loadFileOverridesEnvDescriptors(file)(index)(envName),
});
const loadFileDescriptors = makeWeakCacheSync((file: ValidatedFile) =>
  buildRootDescriptors(file, file.filepath, createUncachedDescriptors),
);
const loadFileEnvDescriptors = makeWeakCacheSync((file: ValidatedFile) =>
  makeStrongCacheSync((envName: string) =>
    buildEnvDescriptors(
      file,
      file.filepath,
      createUncachedDescriptors,
      envName,
    ),
  ),
);
const loadFileOverridesDescriptors = makeWeakCacheSync((file: ValidatedFile) =>
  makeStrongCacheSync((index: number) =>
    buildOverrideDescriptors(
      file,
      file.filepath,
      createUncachedDescriptors,
      index,
    ),
  ),
);
const loadFileOverridesEnvDescriptors = makeWeakCacheSync(
  (file: ValidatedFile) =>
    makeStrongCacheSync((index: number) =>
      makeStrongCacheSync((envName: string) =>
        buildOverrideEnvDescriptors(
          file,
          file.filepath,
          createUncachedDescriptors,
          index,
          envName,
        ),
      ),
    ),
);

function buildRootDescriptors({ dirname, options }, alias, descriptors) {
  return descriptors(dirname, options, alias);
}

function buildEnvDescriptors(
  { dirname, options },
  alias,
  descriptors,
  envName,
) {
  const opts = options.env && options.env[envName];
  return opts ? descriptors(dirname, opts, `${alias}.env["${envName}"]`) : null;
}

function buildOverrideDescriptors(
  { dirname, options },
  alias,
  descriptors,
  index,
) {
  const opts = options.overrides && options.overrides[index];
  if (!opts) throw new Error("Assertion failure - missing override");

  return descriptors(dirname, opts, `${alias}.overrides[${index}]`);
}

function buildOverrideEnvDescriptors(
  { dirname, options },
  alias,
  descriptors,
  index,
  envName,
) {
  const override = options.overrides && options.overrides[index];
  if (!override) throw new Error("Assertion failure - missing override");

  const opts = override.env && override.env[envName];
  return opts
    ? descriptors(
        dirname,
        opts,
        `${alias}.overrides[${index}].env["${envName}"]`,
      )
    : null;
}

function makeChainWalker<ArgT: { options: ValidatedOptions, dirname: string }>({
  root,
  env,
  overrides,
  overridesEnv,
}: {
  root: ArgT => OptionsAndDescriptors,
  env: (ArgT, string) => OptionsAndDescriptors | null,
  overrides: (ArgT, number) => OptionsAndDescriptors,
  overridesEnv: (ArgT, number, string) => OptionsAndDescriptors | null,
}): (
  ArgT,
  ConfigContext,
  Set<ConfigFile> | void,
) => Handler<ConfigChain | null> {
  return function* chainWalker(input, context, files = new Set()) {
    const { dirname } = input;

    const flattenedConfigs = [];

    const rootOpts = root(input);
    if (configIsApplicable(rootOpts, dirname, context, input.filepath)) {
      flattenedConfigs.push(rootOpts);

      const envOpts = env(input, context.envName);
      if (
        envOpts &&
        configIsApplicable(envOpts, dirname, context, input.filepath)
      ) {
        flattenedConfigs.push(envOpts);
      }

      (rootOpts.options.overrides || []).forEach((_, index) => {
        const overrideOps = overrides(input, index);
        if (configIsApplicable(overrideOps, dirname, context, input.filepath)) {
          flattenedConfigs.push(overrideOps);

          const overrideEnvOpts = overridesEnv(input, index, context.envName);
          if (
            overrideEnvOpts &&
            configIsApplicable(
              overrideEnvOpts,
              dirname,
              context,
              input.filepath,
            )
          ) {
            flattenedConfigs.push(overrideEnvOpts);
          }
        }
      });
    }

    // Process 'ignore' and 'only' before 'extends' items are processed so
    // that we don't do extra work loading extended configs if a file is
    // ignored.
    if (
      flattenedConfigs.some(({ options: { ignore, only } }) =>
        shouldIgnore(context, ignore, only, dirname),
      )
    ) {
      return null;
    }

    const chain = emptyChain();

    for (const op of flattenedConfigs) {
      if (
        !(yield* mergeExtendsChain(chain, op.options, dirname, context, files))
      ) {
        return null;
      }

      mergeChainOpts(chain, op);
    }
    return chain;
  };
}

function* mergeExtendsChain(
  chain: ConfigChain,
  opts: ValidatedOptions,
  dirname: string,
  context: ConfigContext,
  files: Set<ConfigFile>,
): Handler<boolean> {
  if (opts.extends === undefined) return true;

  const file = yield* loadConfig(
    opts.extends,
    dirname,
    context.envName,
    context.caller,
  );

  if (files.has(file)) {
    throw new Error(
      `Configuration cycle detected loading ${file.filepath}.\n` +
        `File already loaded following the config chain:\n` +
        Array.from(files, file => ` - ${file.filepath}`).join("\n"),
    );
  }

  files.add(file);
  const fileChain = yield* loadFileChain(
    validateExtendFile(file),
    context,
    files,
  );
  files.delete(file);

  if (!fileChain) return false;

  mergeChain(chain, fileChain);

  return true;
}

function mergeChain(target: ConfigChain, source: ConfigChain): ConfigChain {
  target.options.push(...source.options);
  target.plugins.push(...source.plugins);
  target.presets.push(...source.presets);

  return target;
}

function mergeChainOpts(
  target: ConfigChain,
  { options, plugins, presets }: OptionsAndDescriptors,
): ConfigChain {
  target.options.push(options);
  target.plugins.push(...plugins());
  target.presets.push(...presets());

  return target;
}

function emptyChain(): ConfigChain {
  return {
    options: [],
    presets: [],
    plugins: [],
  };
}

function normalizeOptions(opts: ValidatedOptions): ValidatedOptions {
  const options = {
    ...opts,
  };
  delete options.extends;
  delete options.env;
  delete options.overrides;
  delete options.plugins;
  delete options.presets;
  delete options.passPerPreset;
  delete options.ignore;
  delete options.only;
  delete options.test;
  delete options.include;
  delete options.exclude;

  // "sourceMap" is just aliased to sourceMap, so copy it over as
  // we merge the options together.
  if (Object.prototype.hasOwnProperty.call(options, "sourceMap")) {
    options.sourceMaps = options.sourceMap;
    delete options.sourceMap;
  }
  return options;
}

function dedupDescriptors(
  items: Array<UnloadedDescriptor>,
): Array<UnloadedDescriptor> {
  const map: Map<
    Function,
    Map<string | void, { value: UnloadedDescriptor }>,
  > = new Map();

  const descriptors = [];

  for (const item of items) {
    if (typeof item.value === "function") {
      const fnKey = item.value;
      let nameMap = map.get(fnKey);
      if (!nameMap) {
        nameMap = new Map();
        map.set(fnKey, nameMap);
      }
      let desc = nameMap.get(item.name);
      if (!desc) {
        desc = { value: item };
        descriptors.push(desc);

        // Treat passPerPreset presets as unique, skipping them
        // in the merge processing steps.
        if (!item.ownPass) nameMap.set(item.name, desc);
      } else {
        desc.value = item;
      }
    } else {
      descriptors.push({ value: item });
    }
  }

  return descriptors.reduce((acc, desc) => {
    acc.push(desc.value);
    return acc;
  }, []);
}

function configIsApplicable(
  { options }: OptionsAndDescriptors,
  dirname: string,
  context: ConfigContext,
  configName: string,
): boolean {
  return (
    (options.test === undefined ||
      configFieldIsApplicable(context, options.test, dirname, configName)) &&
    (options.include === undefined ||
      configFieldIsApplicable(context, options.include, dirname, configName)) &&
    (options.exclude === undefined ||
      !configFieldIsApplicable(context, options.exclude, dirname, configName))
  );
}

function configFieldIsApplicable(
  context: ConfigContext,
  test: ConfigApplicableTest,
  dirname: string,
  configName: string,
): boolean {
  const patterns = Array.isArray(test) ? test : [test];

  return matchesPatterns(context, patterns, dirname, configName);
}

/**
 * Tests if a filename should be ignored based on "ignore" and "only" options.
 */
function shouldIgnore(
  context: ConfigContext,
  ignore: ?IgnoreList,
  only: ?IgnoreList,
  dirname: string,
): boolean {
  if (ignore && matchesPatterns(context, ignore, dirname)) {
    debug(
      "Ignored %o because it matched one of %O from %o",
      context.filename,
      ignore,
      dirname,
    );
    return true;
  }

  if (only && !matchesPatterns(context, only, dirname)) {
    debug(
      "Ignored %o because it failed to match one of %O from %o",
      context.filename,
      only,
      dirname,
    );
    return true;
  }

  return false;
}

/**
 * Returns result of calling function with filename if pattern is a function.
 * Otherwise returns result of matching pattern Regex with filename.
 */
function matchesPatterns(
  context: ConfigContext,
  patterns: IgnoreList,
  dirname: string,
  configName: string,
): boolean {
  return patterns.some(pattern =>
    matchPattern(pattern, dirname, context.filename, context, configName),
  );
}

function matchPattern(
  pattern,
  dirname,
  pathToTest,
  context: ConfigContext,
  configName: string,
): boolean {
  if (typeof pattern === "function") {
    return !!endHiddenCallStack(pattern)(pathToTest, {
      dirname,
      envName: context.envName,
      caller: context.caller,
    });
  }

  if (typeof pathToTest !== "string") {
    throw new ConfigError(
      `Configuration contains string/RegExp pattern, but no filename was passed to Babel`,
      configName,
    );
  }

  if (typeof pattern === "string") {
    pattern = pathPatternToRegex(pattern, dirname);
  }
  return pattern.test(pathToTest);
}
