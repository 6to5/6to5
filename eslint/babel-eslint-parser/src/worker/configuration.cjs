const babel = require("./babel-core.cjs");

/**
 * Merge user supplied estree plugin options to default estree plugin options
 *
 * @param {*} babelOptions
 * @returns {Array} Merged parser plugin descriptors
 */
function getParserPlugins(babelOptions) {
  const babelParserPlugins = babelOptions.parserOpts?.plugins ?? [];
  // todo: enable classFeatures when it is supported by ESLint
  const estreeOptions = { classFeatures: false };
  for (const plugin of babelParserPlugins) {
    if (Array.isArray(plugin) && plugin[0] === "estree") {
      Object.assign(estreeOptions, plugin[1]);
      break;
    }
  }
  // estree must be the first parser plugin to work with other parser plugins
  return [["estree", estreeOptions], ...babelParserPlugins];
}

function normalizeParserOptions(options) {
  return {
    sourceType: options.sourceType,
    filename: options.filePath,
    ...options.babelOptions,
    parserOpts: {
      allowImportExportEverywhere: options.allowImportExportEverywhere,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      ...options.babelOptions.parserOpts,
      plugins: getParserPlugins(options.babelOptions),
      // skip comment attaching for parsing performance
      attachComment: false,
      ranges: true,
      tokens: true,
    },
    caller: {
      name: "@babel/eslint-parser",
      ...options.babelOptions.caller,
    },
  };
}

function validateResolvedConfig(config, options) {
  if (config !== null) {
    if (options.requireConfigFile !== false) {
      if (!config.hasFilesystemConfig()) {
        let error = `No Babel config file detected for ${config.options.filename}. Either disable config file checking with requireConfigFile: false, or configure Babel so that it can find the config files.`;

        if (config.options.filename.includes("node_modules")) {
          error += `\nIf you have a .babelrc.js file or use package.json#babel, keep in mind that it's not used when parsing dependencies. If you want your config to be applied to your whole app, consider using babel.config.js or babel.config.json instead.`;
        }

        throw new Error(error);
      }
    }
    return config.options;
  }
}

function getDefaultParserOptions(options) {
  return {
    plugins: [],
    ...options,
    babelrc: false,
    configFile: false,
    browserslistConfigFile: false,
    ignore: null,
    only: null,
  };
}

module.exports = function normalizeBabelParseConfig(options) {
  const parseOptions = normalizeParserOptions(options);

  if (process.env.BABEL_8_BREAKING) {
    return babel
      .loadPartialConfigAsync(parseOptions)
      .then(config => validateConfigWithFallback(config));
  } else {
    const config = babel.loadPartialConfigSync(parseOptions);
    return validateConfigWithFallback(config);
  }

  function validateConfigWithFallback(inputConfig) {
    const result = validateResolvedConfig(inputConfig, options);
    if (result) {
      return result;
    } else {
      // Fallback when `loadPartialConfig` returns `null` (e.g.: when the file is ignored)
      return getDefaultParserOptions(parseOptions);
    }
  }
};
