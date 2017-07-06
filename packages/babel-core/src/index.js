export File from "./transformation/file";
export buildExternalHelpers from "./tools/build-external-helpers";
export { resolvePlugin, resolvePreset } from "./config/loading/files";

export { version } from "../package";
export { getEnv } from "./config/helpers/environment";

export * as messages from "babel-messages";
export * as types from "babel-types";
export traverse from "babel-traverse";
export template from "babel-template";

import loadConfig from "./config";

export function loadOptions(opts): Object | null {
  const config = loadConfig(opts);

  return config ? config.options : null;
}

// For easier backward-compatibility, provide an API like the one we exposed in Babel 6.
export class OptionManager {
  init(opts) {
    return loadOptions(opts);
  }
}

export function Plugin(alias) {
  throw new Error(`The (${alias}) Babel 5 plugin is being run with Babel 6.`);
}

export {
  transform,
  analyse,
  transformFromAst,
  transformFile,
  transformFileSync,
} from "./transformation/pipeline";

/**
 * Recommended set of compilable extensions. Not used in babel-core directly, but meant as
 * as an easy source for tooling making use of babel-core.
 */
export const DEFAULT_EXTENSIONS = Object.freeze([
  ".js",
  ".jsx",
  ".es6",
  ".es",
  ".mjs",
]);
