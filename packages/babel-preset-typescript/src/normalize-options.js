// @flow

import findSuggestion from "levenary";

const PACKAGE_NAME = "@babel/preset-typescript";

const TopLevelOptions = [
  "allowNamespaces",
  "ignoreExtensions",
  "jsxPragma",
  "onlyRemoveTypeImports",
];

function validateTopLevelOptions(options) {
  checkRemovedOption(options);
  for (const option of Object.keys(options)) {
    if (!TopLevelOptions.includes(option)) {
      const suggestion = findSuggestion(option, TopLevelOptions);
      throw new Error(
        `${PACKAGE_NAME}: '${option}' is not a valid top-level option.\n` +
          `Maybe you meant to use '${suggestion}'?`,
      );
    }
  }
}

function validateBoolOption(
  opts: {},
  key: string,
  defaultValue: ?boolean,
): ?boolean {
  const value = opts[key] ?? defaultValue;

  if (typeof value !== "boolean" && value != null) {
    throw new Error(`${PACKAGE_NAME}: '${key}' option must be a boolean.`);
  }

  opts[key] = value;
}

function validateStringOption(
  opts: {},
  key: string,
  defaultValue: ?string,
): ?boolean {
  const value = opts[key] ?? defaultValue;

  if (typeof value !== "string" && value != null) {
    throw new Error(`${PACKAGE_NAME}: '${key}' option must be a string.`);
  }

  opts[key] = value;
}

function checkRemovedOption(opts: Object) {
  const { isTSX, allExtensions } = opts;
  if (isTSX !== undefined || allExtensions !== undefined) {
    throw new Error(`${PACKAGE_NAME}: The .allExtensions and .isTSX options have been removed.
If you want to disable file extension-based JSX detection, you can set the .ignoreExtensions option to true.
If you want to force JSX parsing, you can enable the @babel/plugin-syntax-jsx plugin.`);
  }
}

export default function normalizeOptions(options: {}) {
  const opts = { ...options };
  validateTopLevelOptions(opts);
  validateBoolOption(opts, "allowNamespaces");
  validateBoolOption(opts, "ignoreExtensions", false);
  validateStringOption(opts, "jsxPragma");
  validateBoolOption(opts, "onlyRemoveTypeImports");
  return opts;
}
