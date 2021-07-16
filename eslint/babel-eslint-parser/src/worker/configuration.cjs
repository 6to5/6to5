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
      ranges: true,
      tokens: true,
    },
    caller: {
      name: "@babel/eslint-parser",
      ...options.babelOptions.caller,
    },
  };
}

function validateResolvedConfig(config, options, parseOptions) {
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
    if (config.options) return config.options;
  }

  return getDefaultParserOptions(parseOptions);
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

exports.normalizeBabelParseConfig = async function (options) {
  const parseOptions = normalizeParserOptions(options);
  const config = await babel.loadPartialConfigAsync(parseOptions);
  return validateResolvedConfig(config, options, parseOptions);
};

exports.normalizeBabelParseConfigSync = function (options) {
  const parseOptions = normalizeParserOptions(options);
  const config = babel.loadPartialConfigSync(parseOptions);
  return validateResolvedConfig(config, options, parseOptions);
};
