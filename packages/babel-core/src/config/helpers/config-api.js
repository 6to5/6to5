// @flow

import semver from "semver";
import { version as coreVersion } from "../../";
import {
  assertSimpleType,
  type CacheConfigurator,
  type SimpleCacheConfigurator,
} from "../caching";

import type { CallerMetadata } from "../validation/options";

type EnvFunction = {
  (): string,
  <T>((string) => T): T,
  (string): boolean,
  (Array<string>): boolean,
};

export type PluginAPI = {|
  version: string,
  cache: SimpleCacheConfigurator,
  env: EnvFunction,
  async: () => boolean,
  assertVersion: typeof assertVersion,
  caller?: any,
|};

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

      return value.some(entry => {
        if (typeof entry !== "string") {
          throw new Error("Unexpected non-string value");
        }
        return entry === data.envName;
      });
    });

  const caller: any = cb =>
    cache.using(data => assertSimpleType(cb(data.caller)));

  return {
    version: coreVersion,
    cache: cache.simple(),
    // Expose ".env()" so people can easily get the same env that we expose using the "env" key.
    env,
    async: () => false,
    caller,
    assertVersion,
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
      `to see what is calling Babel. It is also possible a globally ` +
      `installed version of babel-cli is being used if neither that package ` +
      `nor @babel/cli appear inside the package.json`,
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
