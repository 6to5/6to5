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
import { ConfigPrinter, ChainFormatter } from "./printer";

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
  files: Set<string>,
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
  showConfig: boolean,
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
    files: new Set(),
  };
}

export const buildPresetChainWalker: (
  arg: PresetInstance,
  context: *,
) => * = makeChainWalker({
  root: preset => loadPresetDescriptors(preset),
  env: (preset, envName) => loadPresetEnvDescriptors(preset)(envName),
  overrides: (preset, index) => loadPresetOverridesDescriptors(preset)(index),
  overridesEnv: (preset, index, envName) =>
    loadPresetOverridesEnvDescriptors(preset)(index)(envName),
  createLogger: () => () => {}, // Currently we don't support logging how preset is expanded
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

export type FileHandling = "transpile" | "ignored" | "unsupported";
export type RootConfigChain = ConfigChain & {
  babelrc: ConfigFile | void,
  config: ConfigFile | void,
  ignore: IgnoreFile | void,
  fileHandling: FileHandling,
  files: Set<string>,
};

/**
 * Build a config chain for Babel's full root configuration.
 */
export function* buildRootChain(
  opts: ValidatedOptions,
  context: ConfigContext,
): Handler<RootConfigChain | null> {
  let configReport, babelRcReport;
  const programmaticLogger = new ConfigPrinter();
  const programmaticChain = yield* loadProgrammaticChain(
    {
      options: opts,
      dirname: context.cwd,
    },
    context,
    undefined,
    programmaticLogger,
  );
  if (!programmaticChain) return null;
  const programmaticReport = yield* programmaticLogger.output();

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
  const configFileLogger = new ConfigPrinter();
  if (configFile) {
    const validatedFile = validateConfigFile(configFile);
    const result = yield* loadFileChain(
      validatedFile,
      context,
      undefined,
      configFileLogger,
    );
    if (!result) return null;
    configReport = yield* configFileLogger.output();

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

  let ignoreFile, babelrcFile;
  let isIgnored = false;
  const fileChain = emptyChain();
  // resolve all .babelrc files
  if (
    (babelrc === true || babelrc === undefined) &&
    typeof context.filename === "string"
  ) {
    const pkgData = yield* findPackageData(context.filename);

    if (
      pkgData &&
      babelrcLoadEnabled(context, pkgData, babelrcRoots, babelrcRootsDirectory)
    ) {
      ({ ignore: ignoreFile, config: babelrcFile } = yield* findRelativeConfig(
        pkgData,
        context.envName,
        context.caller,
      ));

      if (ignoreFile) {
        fileChain.files.add(ignoreFile.filepath);
      }

      if (
        ignoreFile &&
        shouldIgnore(context, ignoreFile.ignore, null, ignoreFile.dirname)
      ) {
        isIgnored = true;
      }

      if (babelrcFile && !isIgnored) {
        const validatedFile = validateBabelrcFile(babelrcFile);
        const babelrcLogger = new ConfigPrinter();
        const result = yield* loadFileChain(
          validatedFile,
          context,
          undefined,
          babelrcLogger,
        );
        if (!result) {
          isIgnored = true;
        } else {
          babelRcReport = yield* babelrcLogger.output();
          mergeChain(fileChain, result);
        }
      }

      if (babelrcFile && isIgnored) {
        fileChain.files.add(babelrcFile.filepath);
      }
    }
  }

  if (context.showConfig) {
    console.log(
      // $FlowIgnore: context.showConfig implies context.filename is not null
      `Babel configs on "${context.filename}" (ascending priority):\n` +
        // print config by the order of ascending priority
        [configReport, babelRcReport, programmaticReport]
          .filter(x => !!x)
          .join("\n\n") +
        "\n-----End Babel configs-----",
    );
  }
  // Insert file chain in front so programmatic options have priority
  // over configuration file chain items.
  const chain = mergeChain(
    mergeChain(mergeChain(emptyChain(), configFileChain), fileChain),
    programmaticChain,
  );

  return {
    plugins: isIgnored ? [] : dedupDescriptors(chain.plugins),
    presets: isIgnored ? [] : dedupDescriptors(chain.presets),
    options: isIgnored ? [] : chain.options.map(o => normalizeOptions(o)),
    fileHandling: isIgnored ? "ignored" : "transpile",
    ignore: ignoreFile || undefined,
    babelrc: babelrcFile || undefined,
    config: configFile || undefined,
    files: chain.files,
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
      pat = pathPatternToRegex(pat, babelrcRootsDirectory, false);
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
    options: validate("configfile", file.options),
  }),
);

const validateBabelrcFile = makeWeakCacheSync(
  (file: ConfigFile): ValidatedFile => ({
    filepath: file.filepath,
    dirname: file.dirname,
    options: validate("babelrcfile", file.options),
  }),
);

const validateExtendFile = makeWeakCacheSync(
  (file: ConfigFile): ValidatedFile => ({
    filepath: file.filepath,
    dirname: file.dirname,
    options: validate("extendsfile", file.options),
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
  createLogger: (input, context, baseLogger) =>
    buildProgrammaticLogger(input, context, baseLogger),
});

/**
 * Build a config chain for a given file.
 */
const loadFileChainWalker = makeChainWalker({
  root: file => loadFileDescriptors(file),
  env: (file, envName) => loadFileEnvDescriptors(file)(envName),
  overrides: (file, index) => loadFileOverridesDescriptors(file)(index),
  overridesEnv: (file, index, envName) =>
    loadFileOverridesEnvDescriptors(file)(index)(envName),
  createLogger: (file, context, baseLogger) =>
    buildFileLogger(file.filepath, context, baseLogger),
});

function* loadFileChain(input, context, files, baseLogger) {
  const chain = yield* loadFileChainWalker(input, context, files, baseLogger);
  if (chain) {
    chain.files.add(input.filepath);
  }

  return chain;
}

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

function buildFileLogger(
  filepath: string,
  context: ConfigContext,
  baseLogger: ConfigPrinter | void,
) {
  if (!baseLogger) {
    return () => {};
  }
  return baseLogger.configure(context.showConfig, ChainFormatter.Config, {
    filepath,
  });
}

function buildRootDescriptors({ dirname, options }, alias, descriptors) {
  return descriptors(dirname, options, alias);
}

function buildProgrammaticLogger(_, context, baseLogger: ConfigPrinter | void) {
  if (!baseLogger) {
    return () => {};
  }
  return baseLogger.configure(context.showConfig, ChainFormatter.Programmatic, {
    callerName: context.caller?.name,
  });
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
  createLogger,
}: {|
  root: ArgT => OptionsAndDescriptors,
  env: (ArgT, string) => OptionsAndDescriptors | null,
  overrides: (ArgT, number) => OptionsAndDescriptors,
  overridesEnv: (ArgT, number, string) => OptionsAndDescriptors | null,
  createLogger: (
    ArgT,
    ConfigContext,
    ConfigPrinter | void,
  ) => (OptionsAndDescriptors, ?number, ?string) => void,
|}): (
  ArgT,
  ConfigContext,
  files?: Set<ConfigFile> | void,
  baseLogger: ConfigPrinter | void,
) => Handler<ConfigChain | null> {
  return function* (input, context, files = new Set(), baseLogger) {
    const { dirname } = input;

    const flattenedConfigs: Array<{|
      config: OptionsAndDescriptors,
      index: ?number,
      envName: ?string,
    |}> = [];

    const rootOpts = root(input);
    if (configIsApplicable(rootOpts, dirname, context)) {
      flattenedConfigs.push({
        config: rootOpts,
        envName: undefined,
        index: undefined,
      });

      const envOpts = env(input, context.envName);
      if (envOpts && configIsApplicable(envOpts, dirname, context)) {
        flattenedConfigs.push({
          config: envOpts,
          envName: context.envName,
          index: undefined,
        });
      }

      (rootOpts.options.overrides || []).forEach((_, index) => {
        const overrideOps = overrides(input, index);
        if (configIsApplicable(overrideOps, dirname, context)) {
          flattenedConfigs.push({
            config: overrideOps,
            index,
            envName: undefined,
          });

          const overrideEnvOpts = overridesEnv(input, index, context.envName);
          if (
            overrideEnvOpts &&
            configIsApplicable(overrideEnvOpts, dirname, context)
          ) {
            flattenedConfigs.push({
              config: overrideEnvOpts,
              index,
              envName: context.envName,
            });
          }
        }
      });
    }

    // Process 'ignore' and 'only' before 'extends' items are processed so
    // that we don't do extra work loading extended configs if a file is
    // ignored.
    if (
      flattenedConfigs.some(({ config: { options: { ignore, only } } }) =>
        shouldIgnore(context, ignore, only, dirname),
      )
    ) {
      return null;
    }

    const chain = emptyChain();
    const logger = createLogger(input, context, baseLogger);

    for (const { config, index, envName } of flattenedConfigs) {
      if (
        !(yield* mergeExtendsChain(
          chain,
          config.options,
          dirname,
          context,
          files,
          baseLogger,
        ))
      ) {
        return null;
      }

      logger(config, index, envName);
      yield* mergeChainOpts(chain, config);
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
  baseLogger: ConfigPrinter | void,
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
    baseLogger,
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
  for (const file of source.files) {
    target.files.add(file);
  }

  return target;
}

function* mergeChainOpts(
  target: ConfigChain,
  { options, plugins, presets }: OptionsAndDescriptors,
): Handler<ConfigChain> {
  target.options.push(options);
  target.plugins.push(...(yield* plugins()));
  target.presets.push(...(yield* presets()));

  return target;
}

function emptyChain(): ConfigChain {
  return {
    options: [],
    presets: [],
    plugins: [],
    files: new Set(),
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
): boolean {
  return (
    (options.test === undefined ||
      configFieldIsApplicable(context, options.test, dirname)) &&
    (options.include === undefined ||
      configFieldIsApplicable(context, options.include, dirname)) &&
    (options.exclude === undefined ||
      !configFieldIsApplicable(context, options.exclude, dirname))
  );
}

function configFieldIsApplicable(
  context: ConfigContext,
  test: ConfigApplicableTest,
  dirname: string,
): boolean {
  const patterns = Array.isArray(test) ? test : [test];

  return matchesPatterns(context, patterns, dirname);
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
    const message = `No config is applied to "${
      context.filename ?? "(unknown)"
    }" because it matches one of \`ignore: ${JSON.stringify(
      ignore,
    )}\` from "${dirname}"`;
    debug(message);
    if (context.showConfig) {
      console.log(message);
    }
    return true;
  }

  if (only && !matchesPatterns(context, only, dirname)) {
    const message = `No config is applied to "${
      context.filename ?? "(unknown)"
    }" because it fails to match one of \`only: ${JSON.stringify(
      only,
    )}\` from "${dirname}"`;
    debug(message);
    if (context.showConfig) {
      console.log(message);
    }
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
): boolean {
  return patterns.some(pattern =>
    matchPattern(pattern, dirname, context.filename, context),
  );
}

function matchPattern(
  pattern,
  dirname,
  pathToTest,
  context: ConfigContext,
): boolean {
  if (typeof pattern === "function") {
    return !!pattern(pathToTest, {
      dirname,
      envName: context.envName,
      caller: context.caller,
    });
  }

  if (typeof pathToTest !== "string") {
    throw new Error(
      `Configuration contains string/RegExp pattern, but no filename was passed to Babel`,
    );
  }

  if (typeof pattern === "string") {
    pattern = pathPatternToRegex(pattern, dirname);
  }
  return pattern.test(pathToTest);
}
