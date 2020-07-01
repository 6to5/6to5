// @flow

import findSuggestion from "levenary";
const PACKAGE_NAME = "@babel/preset-react";

const TopLevelOptions = [
  "development",
  "importSource",
  "pragma",
  "pragmaFrag",
  "pure",
  "runtime",
  "throwIfNamespace",
  "useBuiltIns",
  "useSpread",
];

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

export default function normalizeOptions(options: Object) {
  const opts = { ...options };
  validateTopLevelOptions(opts);
  validateBoolOption(opts, "development", false);
  validateStringOption(opts, "importSource");
  validateStringOption(opts, "runtime", "classic");
  validateStringOption(
    opts,
    "pragma",
    // TODO: (Babel 8) Remove setting these defaults
    opts.runtime === "classic" ? "React.createElement" : undefined,
  );
  validateStringOption(
    opts,
    "pragmaFrag",
    // TODO: (Babel 8) Remove setting these defaults
    opts.runtime === "classic" ? "React.Fragment" : undefined,
  );
  validateBoolOption(opts, "pure");
  validateBoolOption(opts, "throwIfNamespace", true);
  validateBoolOption(opts, "useBuiltIns", false);
  validateBoolOption(opts, "useSpread", false);
  return opts;
}
