// @flow

export { default as File } from "./transformation/file/file";
export { default as buildExternalHelpers } from "./tools/build-external-helpers";
export { resolvePlugin, resolvePreset } from "./config/files";

export { version } from "../package.json";
export { getEnv } from "./config/helpers/environment";

export * as types from "@babel/types";
export { tokTypes } from "@babel/parser";

export { default as traverse } from "@babel/traverse";
export { default as template } from "@babel/template";

export { createConfigItem } from "./config/item";

export {
  loadPartialConfig,
  loadPartialConfigSync,
  loadPartialConfigAsync,
  loadOptions,
  loadOptionsSync,
  loadOptionsAsync,
} from "./config";

export {
  getDependencies,
  getExternalDependencies,
} from "./config/helpers/config-api";

export { transform, transformSync, transformAsync } from "./transform";
export {
  transformFile,
  transformFileSync,
  transformFileAsync,
} from "./transform-file";
export {
  transformFromAst,
  transformFromAstSync,
  transformFromAstAsync,
} from "./transform-ast";
export { parse, parseSync, parseAsync } from "./parse";

/**
 * Recommended set of compilable extensions. Not used in @babel/core directly, but meant as
 * as an easy source for tooling making use of @babel/core.
 */
export const DEFAULT_EXTENSIONS = Object.freeze([
  ".js",
  ".jsx",
  ".es6",
  ".es",
  ".mjs",
]);

// For easier backward-compatibility, provide an API like the one we exposed in Babel 6.
import { loadOptions } from "./config";
export class OptionManager {
  init(opts: {}) {
    return loadOptions(opts);
  }
}

export function Plugin(alias: string) {
  throw new Error(
    `The (${alias}) Babel 5 plugin is being run with an unsupported Babel version.`,
  );
}
