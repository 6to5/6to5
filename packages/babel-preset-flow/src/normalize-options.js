// @flow

import findSuggestion from "levenary";

const PACKAGE_NAME = "@babel/preset-flow";

const TopLevelOptions = ["all", "allowDeclareFields", "ignoreExtensions"];

function validateTopLevelOptions(options) {
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

export default function normalizeOptions(options: Object) {
  const opts = { ...options };
  validateTopLevelOptions(opts);
  validateBoolOption(opts, "all");
  validateBoolOption(opts, "allowDeclareFields");
  validateBoolOption(opts, "ignoreExtensions", false);
  return opts;
}
