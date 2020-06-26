// @flow

import semver from "semver";
import { version as coreVersion } from "../../";
import {
  assertSimpleType,
  type CacheConfigurator,
  type SimpleCacheConfigurator,
  type SimpleType,
} from "../caching";

import path from "path";

import type { CallerMetadata } from "../validation/options";

type EnvFunction = {
  (): string,
  <T>((string) => T): T,
  (string): boolean,
  (Array<string>): boolean,
};

type CallerFactory = ((CallerMetadata | void) => mixed) => SimpleType;

export type PluginAPI = {|
  version: string,
  cache: SimpleCacheConfigurator,
  env: EnvFunction,
  async: () => boolean,
  assertVersion: typeof assertVersion,
  caller?: CallerFactory,
  addExternalDependency: (
    externalDependencyFileName: string,
    dependentFileName: string,
  ) => void,
|};

/**
 * "dependencies" are source files that are directly compiled as part of the
 * normal compilation process.
 *
 * "externalDependencies" are non-source files that should trigger a recompilation
 * of some source file when they are changed. An example is a markdown file that
 * is inlined into a source file as part of a Babel plugin.
 */

const dependencies = new Map<string, Set<string>>();
const externalDependencies = new Map<string, Set<string>>();
/**
 * @returns a map of source file paths to their external dependencies.
 */
export const getDependencies = () => dependencies;
/**
 * @returns a map of external dependencies to the source file paths
 * that depend on them.
 */
export const getExternalDependencies = () => externalDependencies;

/**
 * Indicate that Babel should recompile the file at @param dependentFilePath when
 * the file at @param externalDependencyPath changes. @param externalDependencyPath can
 * be any arbitrary file. NOTE: This currently only works with @babel/cli's --watch flag.
 * @param externalDependencyPath Must be either
 * absolute or relative to @param currentFilePath.
 * @param dependentFilePath Must be absolute or relative to the directory Babel was launched from.
 * For plugin authors, this is usually the current file being processed by Babel/your plugin.
 * It can be found at: "state.file.opts.filename".
 */
function addExternalDependency(
  externalDependencyPath: string,
  dependentFilePath: string,
): void {
  /**
   * Inside the dependency maps we want to store all paths as absolute because we can
   * derive a relative path from an absolute path but not vice-versa. Also, Webpack's
   * `addDependency` requires absolute paths.
   */
  const currentFileAbsolutePath = path.resolve(dependentFilePath);
  const currentFileDir = path.dirname(currentFileAbsolutePath);
  const externalDependencyAbsolutePath = path.isAbsolute(externalDependencyPath)
    ? externalDependencyPath
    : path.join(currentFileDir, externalDependencyPath);

  if (!dependencies.has(currentFileAbsolutePath)) {
    dependencies.set(currentFileAbsolutePath, new Set());
  }
  if (!externalDependencies.has(externalDependencyAbsolutePath)) {
    externalDependencies.set(externalDependencyAbsolutePath, new Set());
  }
  dependencies.get(currentFileAbsolutePath).add(externalDependencyAbsolutePath);
  externalDependencies
    .get(externalDependencyAbsolutePath)
    .add(currentFileAbsolutePath);
}

export default function makeAPI(
  cache: CacheConfigurator<{ envName: string, caller: CallerMetadata | void }>,
): PluginAPI {
  const env: any = value =>
    cache.using(data => {
      if (typeof value === "undefined") return data.envName;
      if (typeof value === "function") {
        return assertSimpleType(value(data.envName));
      }
      if (!Array.isArray(value)) value = [value];

      return value.some((entry: mixed) => {
        if (typeof entry !== "string") {
          throw new Error("Unexpected non-string value");
        }
        return entry === data.envName;
      });
    });

  const caller = cb => cache.using(data => assertSimpleType(cb(data.caller)));

  return {
    version: coreVersion,
    cache: cache.simple(),
    // Expose ".env()" so people can easily get the same env that we expose using the "env" key.
    env,
    async: () => false,
    caller,
    assertVersion,
    addExternalDependency,
  };
}

function assertVersion(range: string | number): void {
  if (typeof range === "number") {
    if (!Number.isInteger(range)) {
      throw new Error("Expected string or integer value.");
    }
    range = `^${range}.0.0-0`;
  }
  if (typeof range !== "string") {
    throw new Error("Expected string or integer value.");
  }

  if (semver.satisfies(coreVersion, range)) return;

  const limit = Error.stackTraceLimit;

  if (typeof limit === "number" && limit < 25) {
    // Bump up the limit if needed so that users are more likely
    // to be able to see what is calling Babel.
    Error.stackTraceLimit = 25;
  }

  const err = new Error(
    `Requires Babel "${range}", but was loaded with "${coreVersion}". ` +
      `If you are sure you have a compatible version of @babel/core, ` +
      `it is likely that something in your build process is loading the ` +
      `wrong version. Inspect the stack trace of this error to look for ` +
      `the first entry that doesn't mention "@babel/core" or "babel-core" ` +
      `to see what is calling Babel.`,
  );

  if (typeof limit === "number") {
    Error.stackTraceLimit = limit;
  }

  throw Object.assign(
    err,
    ({
      code: "BABEL_VERSION_UNSUPPORTED",
      version: coreVersion,
      range,
    }: any),
  );
}
